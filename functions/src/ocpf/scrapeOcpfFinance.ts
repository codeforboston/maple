// TODO: After validating output against the OCPF website, flip to:
// export const scrapeOcpfFinance = functions.pubsub.schedule("every 24 hours").onRun(...)
import { onRequest as onRequestV2 } from "firebase-functions/v2/https"
import * as logger from "firebase-functions/logger"
import { getAuth } from "firebase-admin/auth"
import axios from "axios"
import unzipper from "unzipper"
import * as readline from "readline"
import { db, Timestamp } from "../firebase"
import { currentGeneralCourt, generalCourts } from "../shared"
import {
  OcpfMemberMapping,
  MembersFinance,
  MembersFinanceBreakdown,
  MembersFinanceCandidateFunds,
  MembersFinanceInKind,
  MembersFinanceYearData
} from "./types"

// Set to null to run all members. Use individual CPF_ID to validate single-member output.
const TEST_CPF_ID: number | null = null // For testing, can use 16883,  Rebecca L. Rausch, RLR0

const OCPF_BASE_URL = "https://ocpf2.blob.core.windows.net/downloads/data2"

const currentCourt = generalCourts[currentGeneralCourt]
if (!currentCourt) {
  throw new Error(`No general court entry for court ${currentGeneralCourt}`)
}
const YEARS = [currentCourt.FirstYear, currentCourt.SecondYear].map(String)

// How each OCPF report type (reports.txt Report_Type_ID) is used:
//   totals     — Receipts_Total/Expenditures_Total feed totalRaised/totalSpent;
//                items and Receipts_Unitemized_Total are also used
//   itemsOnly  — items and Receipts_Unitemized_Total used; totals excluded
//                because the same money is already in a "totals" report
//   yearEnd    — annual rollup: totals excluded (duplicate the periodic
//                reports) but stored for the yearEndCheck reconciliation;
//                in-kind items only
//   lifecycle  — rollup of a non-calendar period: totals excluded, in-kind
//                items only
//   skip       — nothing used
// Types missing from this map are treated as itemsOnly and logged for review.
//
// Year-End and lifecycle reports are the main place in-kind contributions
// (401/402/403) are itemized — Deposit and Bank Reports carry none. Their
// other items and Receipts_Unitemized_Total must be ignored: Transition-In
// reports also carry 201/204/206 items, and Year-End Receipts_Unitemized_Total
// holds the full annual receipts. Verified empirically (2025–2026): no in-kind
// item appears on more than one report type.
type ReportHandling = "totals" | "itemsOnly" | "yearEnd" | "lifecycle" | "skip"

const REPORT_TYPE_HANDLING: Record<number, ReportHandling> = {
  70: "totals", // Bank Report — all activity through the depository account
  13: "totals", // External Activity Report — activity outside the depository, not in Bank Reports

  60: "itemsOnly", // Deposit Report — gross amounts; same money appears net-of-fees in the Bank Report
  61: "itemsOnly", // Late Contribution Report — pre-election disclosure; the money is deposited and bank-reported
  63: "itemsOnly", // Subvendor Report — itemizes spending already in the Bank Report
  65: "itemsOnly", // Payroll Itemization Report — itemizes spending already in the Bank Report

  // 32, 36, 45, 52 and 113 are not filed by individual legislators, but listed
  // so they're never treated as unclassified
  11: "yearEnd", // Year-End Report (Depository)
  24: "yearEnd", // Year-End Report (Non-Depository)
  32: "yearEnd", // Year-End Report (PAC)
  36: "yearEnd", // IEPAC Year-End Report
  45: "yearEnd", // Year-End Report (Ballot Question Committee)
  52: "yearEnd", // Year-End Report (Local Party Committee)
  113: "yearEnd", // Year-End Report (Municipal)

  // Verified empirically: CPF 16576's Dissolution Report exactly matched the
  // sum of two Bank Reports covering the same period ($1,583.64)
  12: "lifecycle", // Dissolution Report
  14: "lifecycle", // Transition-Out Report
  15: "lifecycle", // Transition-In Report

  // Supplemental: itemize spending the depository bank already captured in the
  // Bank Report's Expenditures_Total. Verified empirically — summed Bank
  // Reports matched the Year-End Report without these. Their items (354
  // Credit Card Sub-Items, 351 Reimbursement Sub-Items) aren't used.
  80: "skip", // Credit Card Report
  90: "skip" // Reimbursement Report
}

// In-kind item record types (Individual, Committee, Union, Aggregated
// un-itemized) — the only items read from Year-End/Dissolution/Transition reports
const IN_KIND_RECORD_TYPE_IDS = new Set([401, 402, 403, 420])

// ── Accumulator types ─────────────────────────────────────────────────────────

interface MutableBreakdownEntry {
  count: number
  amount: number
}

interface MutableBreakdown {
  individual: MutableBreakdownEntry
  committee: MutableBreakdownEntry
  union: MutableBreakdownEntry
  unitemized: { amount: number }
  smallDonors: { itemized: MutableBreakdownEntry }
  processingFees: MutableBreakdownEntry
}

interface YearAccumulator {
  totalRaised: number
  totalSpent: number
  breakdown: MutableBreakdown
}

// totalRaised/totalSpent/breakdown are accumulated per year only; the
// cycle-wide values written to Firestore are the sum of the years.
interface MemberAccumulator {
  cpfId: number
  cashOnHand: number
  cashOnHandEndDateMs: number // End_Date (as ms) of the most recent Bank Report (type 70) seen
  startBalance: number
  startBalanceStartDateMs: number // Start_Date (as ms) of the earliest Bank Report (type 70) seen
  depositEndDateMs: number // End_Date (as ms) of the most recent Deposit Report (type 60) seen
  // Both span the whole 2-year election cycle, not per year, and cover
  // itemized individual, committee and union contributions (201/202/203)
  contributionsCount: number
  contributorKeys: Set<string> // see contributorKey()
  candidateFunds: {
    loans: MutableBreakdownEntry
    contributions: MutableBreakdownEntry
  }
  inKind: {
    individual: MutableBreakdownEntry
    committee: MutableBreakdownEntry
    union: MutableBreakdownEntry
    unitemized: { amount: number }
  }
  years: Record<string, YearAccumulator>
  yearEndCheck: Record<
    string,
    { receiptsTotal: number; expendituresTotal: number } | null
  >
  // Raw Receipts_Total/Expenditures_Total summed from "totals" reports
  // (REPORT_TYPE_HANDLING), before item-level adjustments (204, 331/332) — what Year-End
  // Reports are compared against
  reportTotals: Record<string, { receipts: number; expenditures: number }>
  // 204 items, applied after all years are parsed so they can be cut off at
  // the final cashOnHandEndDateMs
  pendingNonContributionReceipts: {
    dateMs: number
    amount: number
    year: string
  }[]
}

function emptyEntry(): MutableBreakdownEntry {
  return { count: 0, amount: 0 }
}

function sumEntries(entries: MutableBreakdownEntry[]): MutableBreakdownEntry {
  return {
    count: entries.reduce((n, e) => n + e.count, 0),
    amount: entries.reduce((n, e) => n + e.amount, 0)
  }
}

function sumBreakdowns(breakdowns: MutableBreakdown[]): MutableBreakdown {
  return {
    individual: sumEntries(breakdowns.map(b => b.individual)),
    committee: sumEntries(breakdowns.map(b => b.committee)),
    union: sumEntries(breakdowns.map(b => b.union)),
    unitemized: {
      amount: breakdowns.reduce((n, b) => n + b.unitemized.amount, 0)
    },
    smallDonors: {
      itemized: sumEntries(breakdowns.map(b => b.smallDonors.itemized))
    },
    processingFees: sumEntries(breakdowns.map(b => b.processingFees))
  }
}

function newAccumulator(cpfId: number): MemberAccumulator {
  const yearInit = (): YearAccumulator => ({
    totalRaised: 0,
    totalSpent: 0,
    breakdown: sumBreakdowns([]) // all zeros
  })
  return {
    cpfId,
    cashOnHand: 0,
    cashOnHandEndDateMs: 0,
    startBalance: 0,
    startBalanceStartDateMs: Infinity,
    depositEndDateMs: 0,
    contributionsCount: 0,
    contributorKeys: new Set(),
    candidateFunds: { loans: emptyEntry(), contributions: emptyEntry() },
    inKind: {
      individual: emptyEntry(),
      committee: emptyEntry(),
      union: emptyEntry(),
      unitemized: { amount: 0 }
    },
    years: Object.fromEntries(YEARS.map(y => [y, yearInit()])),
    yearEndCheck: Object.fromEntries(YEARS.map(y => [y, null])),
    reportTotals: Object.fromEntries(
      YEARS.map(y => [y, { receipts: 0, expenditures: 0 }])
    ),
    pendingNonContributionReceipts: []
  }
}

// ── Cloud Function ────────────────────────────────────────────────────────────

export const scrapeOcpfFinanceV2 = onRequestV2(
  { timeoutSeconds: 540, memory: "512MiB" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed. Use POST.")
      return
    }
    if (process.env.FUNCTIONS_EMULATOR !== "true") {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).send("Unauthorized")
        return
      }
      try {
        const decoded = await getAuth().verifyIdToken(authHeader.slice(7))
        if (decoded["role"] !== "admin") {
          res.status(403).send("Forbidden")
          return
        }
      } catch {
        res.status(401).send("Unauthorized")
        return
      }
    }

    // ── A. Load member mapping ─────────────────────────────────────────────
    const mappingDoc = await db.doc("/config/ocpfMemberMapping").get()
    if (!mappingDoc.exists) {
      logger.warn(
        "config/ocpfMemberMapping not found; no members will be processed"
      )
    }
    const mapping = (mappingDoc.data() ?? {}) as OcpfMemberMapping

    // Build cpfId → memberCode reverse map
    let cpfIdToMemberCode = new Map<number, string>(
      Object.entries(mapping).map(([memberCode, entry]) => [
        entry.cpfId,
        memberCode
      ])
    )

    if (TEST_CPF_ID !== null) {
      cpfIdToMemberCode = new Map(
        [...cpfIdToMemberCode.entries()].filter(
          ([cpfId]) => cpfId === TEST_CPF_ID
        )
      )
      logger.info("TEST MODE: filtering to single member", {
        cpfId: TEST_CPF_ID
      })
    }

    logger.info("Loaded member mapping", {
      totalMembers: Object.keys(mapping).length,
      activeInRun: cpfIdToMemberCode.size
    })

    // ── B. Download each year's ZIP; parse reports.txt then report-items.txt ──
    const accumulators = new Map<string, MemberAccumulator>()

    // reportId → memberCode, for joining with report-items
    const reportIdToMemberCode = new Map<number, string>()
    // Subset of registered reports (Year-End, Dissolution/Transition) whose
    // items are read for in-kind records only
    const inKindOnlyReportIds = new Set<number>()

    for (const year of YEARS) {
      const url = `${OCPF_BASE_URL}/ocpf-${year}-reports.zip`
      logger.info(`Downloading ${url}`)
      const buf = await downloadBuffer(url)
      await parseReports(
        buf,
        year,
        cpfIdToMemberCode,
        accumulators,
        reportIdToMemberCode,
        inKindOnlyReportIds
      )

      logger.info(`Streaming report-items for ${year}`)
      await streamReportItems(
        buf,
        reportIdToMemberCode,
        inKindOnlyReportIds,
        accumulators,
        year
      )
    }

    // ── Non-contribution receipts (204): subtract from totalRaised ────────
    // Bank/External Activity Report Receipts_Total includes this cash since it was received, but
    // OCPF's own public "Receipts" figure nets it out. Only items dated on or
    // before the latest Bank Report's End_Date are subtracted: later ones
    // aren't in any Bank Report yet, and ocpf.us doesn't subtract them either.
    // Verified empirically against ocpf.us: CPF 16883 (Rausch) matched 2026 YTD
    // Receipts to the penny ($101.39 subtracted), and CPF 14454
    // (Brownsberger) only matched once a $1.90 item dated after his latest
    // Bank Report was left out.
    for (const acc of accumulators.values()) {
      for (const item of acc.pendingNonContributionReceipts) {
        if (item.dateMs > acc.cashOnHandEndDateMs) continue
        acc.years[item.year].totalRaised -= item.amount
      }
    }

    // ── Reconciliation: year-end report vs. summed periodic totals ────────
    // Year-end reports (type 11, etc.) are excluded from accumulation because
    // their Receipts_Total/Expenditures_Total are annual rollups that duplicate
    // the periodic (Bank Report) totals.
    // This check runs only once a year-end report exists (i.e.
    // after the calendar year closes) and compares it against what we've summed.
    //
    // Compared against reportTotals (raw report sums), not totalRaised/
    // totalSpent: Year-End Receipts_Total includes 204 cash and excludes
    // 331/332 out-of-pocket items, the same as the periodic reports.
    //
    // Verified empirically (2025): summed Bank Report totals matched the
    // Year-End Report for 409 of 413 legislators (e.g. CPF 16883, exactly
    // $104,770.60), and Bank + External Activity totals matched for every
    // legislator with out-of-pocket items. A mismatch here would point to some
    // report type being mis-handled — do not ignore it, investigate before
    // trusting the displayed totals.
    //
    // Note: this only reconciles report-level totals. It does NOT catch the
    // separate, known gap between totalRaised (Bank Report, after
    // payment-processor fees) and the Contribution Breakdown categories total
    // (Deposit Report items, before deduction of fees). That gap is tracked
    // via record type 319 (breakdown.processingFees).
    for (const [memberCode, acc] of accumulators) {
      for (const year of YEARS) {
        const check = acc.yearEndCheck[year]
        if (!check) continue
        const summedRaised = acc.reportTotals[year]?.receipts ?? 0
        const summedSpent = acc.reportTotals[year]?.expenditures ?? 0
        const raisedDiff = Math.abs(check.receiptsTotal - summedRaised)
        const spentDiff = Math.abs(check.expendituresTotal - summedSpent)
        if (raisedDiff > 0.02 || spentDiff > 0.02) {
          logger.warn(
            "Year-end totals mismatch — investigate periodic report accumulation",
            {
              memberCode,
              year,
              yearEnd: {
                receiptsTotal: check.receiptsTotal,
                expendituresTotal: check.expendituresTotal
              },
              summed: {
                receiptsTotal: summedRaised,
                expendituresTotal: summedSpent
              },
              diff: { receipts: raisedDiff, expenditures: spentDiff }
            }
          )
        }
      }
    }

    // ── C. Write Firestore docs ───────────────────────────────────────────
    const now = Timestamp.now()
    // Firestore batches are limited to 500 operations. MA general courts have ~200 members
    // so this is fine, but if we ever exceed 500 members this will need to be chunked.
    const batch = db.batch()

    for (const [memberCode, acc] of accumulators) {
      const doc = db.doc(
        `/generalCourts/${currentGeneralCourt}/membersFinance/${memberCode}`
      )
      const yearAccs = Object.values(acc.years)
      const data: MembersFinance = {
        ocpfCpfId: acc.cpfId,
        totalRaised: yearAccs.reduce((n, y) => n + y.totalRaised, 0),
        totalSpent: yearAccs.reduce((n, y) => n + y.totalSpent, 0),
        cashOnHand: acc.cashOnHand,
        startBalance: acc.startBalance,
        contributionsCount: acc.contributionsCount,
        uniqueContributorsCount: acc.contributorKeys.size,
        lastUpdated: now,
        // Omitted when the member has no report of that type
        ...(acc.cashOnHandEndDateMs > 0 && {
          bankDataAsOf: Timestamp.fromMillis(acc.cashOnHandEndDateMs)
        }),
        ...(acc.depositEndDateMs > 0 && {
          depositDataAsOf: Timestamp.fromMillis(acc.depositEndDateMs)
        }),
        breakdown: sumBreakdowns(
          yearAccs.map(y => y.breakdown)
        ) as MembersFinanceBreakdown,
        candidateFunds: acc.candidateFunds as MembersFinanceCandidateFunds,
        inKind: acc.inKind as MembersFinanceInKind,
        years: Object.fromEntries(
          Object.entries(acc.years).map(([y, yd]) => [
            y,
            {
              totalRaised: yd.totalRaised,
              totalSpent: yd.totalSpent,
              breakdown: yd.breakdown as MembersFinanceBreakdown,
              finalized: acc.yearEndCheck[y] !== null
            } as MembersFinanceYearData
          ])
        )
      }
      batch.set(doc, data)
    }

    await batch.commit()

    logger.info("scrapeOcpfFinance complete", {
      processed: accumulators.size,
      years: YEARS
    })

    res.status(200).json({
      results: { processed: accumulators.size, years: YEARS }
    })
  }
)

// ── Helpers ───────────────────────────────────────────────────────────────────

async function downloadBuffer(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: "arraybuffer" })
  return Buffer.from(response.data as ArrayBuffer)
}

const REPORT_COLUMN_ALIASES: Record<string, string[]> = {
  cpfId: ["cpf_id"],
  reportId: ["report_id"],
  reportTypeId: ["report_type_id"],
  receiptsTotal: ["receipts_total"],
  receiptsUnitemizedTotal: ["receipts_unitemized_total"],
  expendituresTotal: ["expenditures_total"],
  startBalance: ["start_balance"],
  endBalance: ["end_balance"],
  startDate: ["start_date"],
  endDate: ["end_date"]
}

const ITEM_COLUMN_ALIASES: Record<string, string[]> = {
  reportId: ["report_id"],
  recordTypeId: ["record_type_id"],
  amount: ["amount"],
  date: ["date"],
  name: ["name"], // last name for individuals; full name for committees/unions
  firstName: ["first_name"],
  zip: ["zip"]
}

function buildIndex(
  headers: string[],
  aliases: Record<string, string[]>
): Record<string, number> {
  const normalized = headers.map(h => h.toLowerCase().replace(/\s+/g, "_"))
  const index: Record<string, number> = {}
  for (const [field, aliasList] of Object.entries(aliases)) {
    for (const alias of aliasList) {
      const i = normalized.indexOf(alias)
      if (i !== -1) {
        index[field] = i
        break
      }
    }
    if (!(field in index)) {
      throw new Error(
        `Required column '${field}' not found. Headers: ${headers.join(", ")}`
      )
    }
  }
  return index
}

function col(cols: string[], idx: number): string {
  return (cols[idx] ?? "").trim().replace(/^"|"$/g, "")
}

async function parseReports(
  buf: Buffer,
  year: string,
  cpfIdToMemberCode: Map<number, string>,
  accumulators: Map<string, MemberAccumulator>,
  reportIdToMemberCode: Map<number, string>,
  inKindOnlyReportIds: Set<number>
): Promise<void> {
  const directory = await unzipper.Open.buffer(buf)
  const entry = directory.files.find(
    f => f.type === "File" && f.path.toLowerCase() === "reports.txt"
  )
  if (!entry) throw new Error(`reports.txt not found in zip`)

  const text = (await entry.buffer()).toString("utf8")
  const lines = text.split(/\r?\n/)
  const rawHeaders = lines[0].split("\t").map(h => h.trim())
  const idx = buildIndex(rawHeaders, REPORT_COLUMN_ALIASES)

  let matched = 0
  const warnedReportTypeIds = new Set<number>()
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols = line.split("\t")
    const cpfId = parseInt(col(cols, idx.cpfId), 10)
    const memberCode = cpfIdToMemberCode.get(cpfId)
    if (!memberCode) continue

    const reportId = parseInt(col(cols, idx.reportId), 10)
    if (isNaN(reportId)) continue
    const reportTypeId = parseInt(col(cols, idx.reportTypeId), 10)
    const receiptsTotal = parseFloat(col(cols, idx.receiptsTotal)) || 0
    const receiptsUnitemized =
      parseFloat(col(cols, idx.receiptsUnitemizedTotal)) || 0
    const expendituresTotal = parseFloat(col(cols, idx.expendituresTotal)) || 0
    const startBalance = parseFloat(col(cols, idx.startBalance)) || 0
    const endBalance = parseFloat(col(cols, idx.endBalance)) || 0

    let acc = accumulators.get(memberCode)
    if (!acc) {
      acc = newAccumulator(cpfId)
      accumulators.set(memberCode, acc)
    }

    matched++
    const handling = REPORT_TYPE_HANDLING[reportTypeId]
    if (handling === undefined && !warnedReportTypeIds.has(reportTypeId)) {
      warnedReportTypeIds.add(reportTypeId)
      logger.warn(
        "Unclassified OCPF report type — treated as itemsOnly (totals excluded); classify it in REPORT_TYPE_HANDLING",
        { reportTypeId, reportId, memberCode, year }
      )
    }

    if (handling === "skip") continue

    reportIdToMemberCode.set(reportId, memberCode)

    if (handling === "yearEnd" || handling === "lifecycle") {
      inKindOnlyReportIds.add(reportId)
      if (handling === "yearEnd" && acc.yearEndCheck[year] === null) {
        acc.yearEndCheck[year] = { receiptsTotal, expendituresTotal }
      }
      continue
    }

    // Every remaining report has its unitemized amount counted (Deposit
    // Reports supply it; Bank Reports have blank for that field)
    const yearAcc = acc.years[year]
    yearAcc.breakdown.unitemized.amount += receiptsUnitemized

    if (handling === "totals") {
      yearAcc.totalRaised += receiptsTotal
      yearAcc.totalSpent += expendituresTotal
      acc.reportTotals[year].receipts += receiptsTotal
      acc.reportTotals[year].expenditures += expendituresTotal
    }

    // Report_Type_ID 70 = Bank Report — use End_Balance from the report with the latest End_Date
    const endDate = col(cols, idx.endDate)
    const endDateMs = endDate ? new Date(endDate).getTime() : 0
    if (reportTypeId === 70 && endDateMs > acc.cashOnHandEndDateMs) {
      acc.cashOnHand = endBalance
      acc.cashOnHandEndDateMs = endDateMs
    }
    // Start_Balance from the Bank Report with the earliest Start_Date, i.e. cash
    // on hand at the start of the election cycle.
    const startDate = col(cols, idx.startDate)
    const startDateMs = startDate ? new Date(startDate).getTime() : Infinity
    if (reportTypeId === 70 && startDateMs < acc.startBalanceStartDateMs) {
      acc.startBalance = startBalance
      acc.startBalanceStartDateMs = startDateMs
    }
    // Deposit Reports are filed more frequently than Bank Reports, so this
    // date is normally later — tracked to show readers why the Contributions
    // Breakdown (sourced mainly from Deposit Report items) and Total Raised
    // (sourced mainly from Bank Reports) can reflect different "as of" dates.
    if (reportTypeId === 60 && endDateMs > acc.depositEndDateMs) {
      acc.depositEndDateMs = endDateMs
    }
  }

  logger.info(`Parsed reports.txt for ${year}`, { matched })
}

async function streamReportItems(
  buf: Buffer,
  reportIdToMemberCode: Map<number, string>,
  inKindOnlyReportIds: Set<number>,
  accumulators: Map<string, MemberAccumulator>,
  year: string
): Promise<void> {
  const directory = await unzipper.Open.buffer(buf)
  const entry = directory.files.find(
    f => f.type === "File" && f.path.toLowerCase() === "report-items.txt"
  )
  if (!entry) throw new Error(`report-items.txt not found in zip`)

  const stream = entry.stream()
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity })

  let isFirst = true
  let idx: Record<string, number> = {}
  let processed = 0
  let skipped = 0

  for await (const line of rl) {
    if (!line.trim()) continue

    if (isFirst) {
      const rawHeaders = line.split("\t").map(h => h.trim())
      idx = buildIndex(rawHeaders, ITEM_COLUMN_ALIASES)
      isFirst = false
      continue
    }

    const cols = line.split("\t")
    const reportId = parseInt(col(cols, idx.reportId), 10)
    const memberCode = reportIdToMemberCode.get(reportId)
    if (!memberCode) {
      skipped++
      continue
    }

    const acc = accumulators.get(memberCode)
    if (!acc) {
      skipped++
      continue
    }

    const recordTypeId = parseInt(col(cols, idx.recordTypeId), 10)
    if (
      inKindOnlyReportIds.has(reportId) &&
      !IN_KIND_RECORD_TYPE_IDS.has(recordTypeId)
    ) {
      skipped++
      continue
    }
    const amount = parseFloat(col(cols, idx.amount)) || 0
    const date = col(cols, idx.date)
    const dateMs = date ? new Date(date).getTime() : NaN
    const contributor = contributorKey(
      recordTypeId,
      col(cols, idx.name),
      col(cols, idx.firstName),
      col(cols, idx.zip)
    )

    accumulateItem(acc, recordTypeId, amount, dateMs, contributor, year)
    processed++
  }

  logger.info(`Streamed report-items.txt for ${year}`, {
    processed,
    skipped
  })
}

// Contribution record types counted in contributionsCount/uniqueContributorsCount:
// Individual (201), Committee (202) and Union/Association (203). Together
// these are the itemized contributions behind totalRaised.
const CONTRIBUTION_RECORD_TYPE_IDS = new Set([201, 202, 203])

// OCPF has no contributor ID, so a contributor is identified by
// record type + name + first name + 5-digit ZIP. Committees and unions leave
// First_Name blank and put the full name in Name. Record type is part of the key so an
// individual never merges with an organization. Street address is not used:
// its formatting varies between filings for the same person ("St" vs "Street").
// Known limits: nicknames ("Dan"/"Daniel") and contributors who moved count
// more than once. Returns null for non-contribution items and rows with no name.
function contributorKey(
  recordTypeId: number,
  name: string,
  firstName: string,
  zip: string
): string | null {
  if (!CONTRIBUTION_RECORD_TYPE_IDS.has(recordTypeId)) return null
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")
  const normalizedName = normalize(name)
  if (!normalizedName) return null
  const zip5 = zip.replace(/\D/g, "").slice(0, 5)
  return [recordTypeId, normalizedName, normalize(firstName), zip5].join("|")
}

function accumulateItem(
  acc: MemberAccumulator,
  recordTypeId: number,
  amount: number,
  dateMs: number,
  contributor: string | null,
  year: string
): void {
  const addTo = (entry: MutableBreakdownEntry) => {
    entry.count++
    entry.amount += amount
  }

  const yearAcc = acc.years[year]
  const yb = yearAcc.breakdown

  if (CONTRIBUTION_RECORD_TYPE_IDS.has(recordTypeId)) {
    acc.contributionsCount++
    if (contributor) acc.contributorKeys.add(contributor)
  }

  switch (recordTypeId) {
    case 201: // Individual Contribution
      addTo(yb.individual)
      if (amount < 200) {
        addTo(yb.smallDonors.itemized)
      }
      break
    case 202: // Committee Contribution
      addTo(yb.committee)
      break
    case 203: // Union/Association Contribution
      addTo(yb.union)
      break
    case 204: // Non-contribution receipt (refunds, misc.) — not real fundraising.
      // Subtracted from totalRaised once all years are parsed (see handler),
      // so the cutoff uses the final Bank Report End_Date.
      acc.pendingNonContributionReceipts.push({ dateMs, amount, year })
      break
    case 206: // Candidate Loan (cash — already in the Receipts_Total of the Bank or External Activity Report it was deposited/reported on)
      addTo(acc.candidateFunds.loans)
      break
    // Out-of-pocket expenses: the candidate paid a campaign expense personally,
    // so the money never reaches the bank and no report's Receipts_Total or
    // Expenditures_Total includes it. OCPF counts it as both a receipt and an
    // expenditure. Verified empirically against ocpf.us 2026 YTD: CPF 19876
    // (Saccardo, 332 items) and CPF 19678 (Loughran, 331 items) matched to the
    // penny only with these amounts added to both totals.
    case 331: // Out-of-pocket expense (as loan)
    case 332: // Out-of-pocket expense (as contribution)
      addTo(
        recordTypeId === 331
          ? acc.candidateFunds.loans
          : acc.candidateFunds.contributions
      )
      yearAcc.totalRaised += amount
      yearAcc.totalSpent += amount
      break
    case 401: // Individual In-kind
      addTo(acc.inKind.individual)
      break
    case 402: // Committee In-kind
      addTo(acc.inKind.committee)
      break
    case 403: // Union In-kind
      addTo(acc.inKind.union)
      break
    case 420: // Aggregated un-itemized in-kind
      acc.inKind.unitemized.amount += amount
      break
    case 319: // Payment-processor fee (see breakdown.processingFees doc comment)
      addTo(yb.processingFees)
      break
    // 205 (Bank Interest) and 220 (Aggregated un-itemized) totals sourced from reports.txt, not items
    default:
      break
  }
}
