// TODO: After validating output against the OCPF website, flip to:
// export const scrapeOcpfFinance = functions.pubsub.schedule("every 24 hours").onRun(...)
import * as functions from "firebase-functions"
import { getAuth } from "firebase-admin/auth"
import axios from "axios"
import unzipper from "unzipper"
import * as readline from "readline"
import { db, Timestamp } from "../firebase"
import { currentGeneralCourt } from "../shared"
import {
  OcpfMemberMapping,
  MembersFinance,
  MembersFinanceBreakdown,
  MembersFinanceCandidateFunds,
  MembersFinanceInKind,
  MembersFinanceOtherReceipts,
  MembersFinanceYearData
} from "./types"

// Set to null to run all members. Use individual CPF_ID to validate single-member output.
const TEST_CPF_ID: number | null = null // For testing, can use 16883,  Rebecca L. Rausch, RLR0

const OCPF_BASE_URL = "https://ocpf2.blob.core.windows.net/downloads/data2"

const YEARS = ["2025", "2026"]

// Annual rollup report types to be excluded.
// Including these would double-count both receipts and expeditures.
// Note: 32, 36, 45, and 52 not relevant to individual legislators, but not harmful to exclude
const YEAR_END_REPORT_TYPE_IDS = new Set([
  11, // Year-End Report (Depository)
  24, // Year-End Report (Non-Depository)
  32, // Year-End Report (PAC)
  36, // IEPAC Year-End Report
  45, // Year-End Report (Ballot Question Committee)
  52, // Year-End Report (Local Party Committee)
  113 // Year-End Report (Municipal)
])

// ── Accumulator types ─────────────────────────────────────────────────────────

interface MutableBreakdownEntry {
  count: number
  amount: number
}

interface MemberAccumulator {
  cpfId: number
  totalRaised: number
  totalSpent: number
  cashOnHand: number
  cashOnHandEndDateMs: number // End_Date (as ms) of the most recent Bank Report (type 70) seen
  depositEndDateMs: number // End_Date (as ms) of the most recent Deposit Report (type 60) seen
  contributorCount: number
  breakdown: {
    individual: MutableBreakdownEntry
    committee: MutableBreakdownEntry
    union: MutableBreakdownEntry
    unitemized: { amount: number }
    smallDonors: { itemized: MutableBreakdownEntry }
    processingFees: MutableBreakdownEntry
  }
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
  otherReceipts: {
    nonContribution: MutableBreakdownEntry
  }
  years: Record<
    string,
    {
      totalRaised: number
      totalSpent: number
      breakdown: {
        individual: MutableBreakdownEntry
        committee: MutableBreakdownEntry
        union: MutableBreakdownEntry
        unitemized: { amount: number }
        smallDonors: { itemized: MutableBreakdownEntry }
        processingFees: MutableBreakdownEntry
      }
    }
  >
  yearEndCheck: Record<
    string,
    { receiptsTotal: number; expendituresTotal: number } | null
  >
}

function emptyEntry(): MutableBreakdownEntry {
  return { count: 0, amount: 0 }
}

function newAccumulator(cpfId: number): MemberAccumulator {
  const yearInit = () => ({
    totalRaised: 0,
    totalSpent: 0,
    breakdown: {
      individual: emptyEntry(),
      committee: emptyEntry(),
      union: emptyEntry(),
      unitemized: { amount: 0 },
      smallDonors: { itemized: emptyEntry() },
      processingFees: emptyEntry()
    }
  })
  return {
    cpfId,
    totalRaised: 0,
    totalSpent: 0,
    cashOnHand: 0,
    cashOnHandEndDateMs: 0,
    depositEndDateMs: 0,
    contributorCount: 0,
    breakdown: {
      individual: emptyEntry(),
      committee: emptyEntry(),
      union: emptyEntry(),
      unitemized: { amount: 0 },
      smallDonors: { itemized: emptyEntry() },
      processingFees: emptyEntry()
    },
    candidateFunds: { loans: emptyEntry(), contributions: emptyEntry() },
    inKind: {
      individual: emptyEntry(),
      committee: emptyEntry(),
      union: emptyEntry(),
      unitemized: { amount: 0 }
    },
    otherReceipts: { nonContribution: emptyEntry() },
    years: Object.fromEntries(YEARS.map(y => [y, yearInit()])),
    yearEndCheck: Object.fromEntries(YEARS.map(y => [y, null]))
  }
}

// ── Cloud Function ────────────────────────────────────────────────────────────

export const scrapeOcpfFinance = functions
  .runWith({ timeoutSeconds: 540, memory: "512MB" })
  .https.onRequest(async (req, res) => {
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
      functions.logger.info("TEST MODE: filtering to single member", {
        cpfId: TEST_CPF_ID
      })
    }

    functions.logger.info("Loaded member mapping", {
      totalMembers: Object.keys(mapping).length,
      activeInRun: cpfIdToMemberCode.size
    })

    // ── B. Download each year's ZIP; parse reports.txt then report-items.txt ──
    const accumulators = new Map<string, MemberAccumulator>()

    // reportId → memberCode, for joining with report-items
    const reportIdToMemberCode = new Map<number, string>()

    for (const year of YEARS) {
      const url = `${OCPF_BASE_URL}/ocpf-${year}-reports.zip`
      functions.logger.info(`Downloading ${url}`)
      const buf = await downloadBuffer(url)
      await parseReports(
        buf,
        year,
        cpfIdToMemberCode,
        accumulators,
        reportIdToMemberCode
      )

      functions.logger.info(`Streaming report-items for ${year}`)
      await streamReportItems(buf, reportIdToMemberCode, accumulators, year)
    }

    // ── Reconciliation: year-end report vs. summed periodic totals ────────
    // Year-end reports (type 11, etc.) are excluded from accumulation because
    // their Receipts_Total/Expenditures_Total are annual rollups that duplicate
    // the periodic (Bank Report) totals.
    // This check runs only once a year-end report exists (i.e.
    // after the calendar year closes) and compares it against what we've summed.
    //
    // Verified empirically (CPF 16883, 2025): summed Bank Report totals matched
    // the Year-End Report exactly ($104,770.60), confirming the type-60 skip
    // logic below does not double-count totalRaised/totalSpent. A mismatch here
    // would point to some other report type being mis-handled — do not ignore
    // it, investigate before trusting the displayed totals.
    //
    // Note: this only reconciles totalRaised/totalSpent (report-level totals).
    // It does NOT catch the separate, known gap between totalRaised (Bank
    // Report, after payment-processor fees) and the Contribution Breakdown
    // categories total (Deposit Report items, before deduction of fees). This gap is
    // found by record type 319 (processing fees), which
    // is currently unhandled in accumulateItem's switch.
    for (const [memberCode, acc] of accumulators) {
      for (const year of YEARS) {
        const check = acc.yearEndCheck[year]
        if (!check) continue
        const summedRaised = acc.years[year]?.totalRaised ?? 0
        const summedSpent = acc.years[year]?.totalSpent ?? 0
        const raisedDiff = Math.abs(check.receiptsTotal - summedRaised)
        const spentDiff = Math.abs(check.expendituresTotal - summedSpent)
        if (raisedDiff > 0.02 || spentDiff > 0.02) {
          functions.logger.warn(
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
      const data: MembersFinance = {
        ocpfCpfId: acc.cpfId,
        totalRaised: acc.totalRaised,
        totalSpent: acc.totalSpent,
        cashOnHand: acc.cashOnHand,
        contributorCount: acc.contributorCount,
        lastUpdated: now,
        bankDataAsOf: Timestamp.fromMillis(acc.cashOnHandEndDateMs),
        depositDataAsOf: Timestamp.fromMillis(acc.depositEndDateMs),
        breakdown: acc.breakdown as MembersFinanceBreakdown,
        candidateFunds: acc.candidateFunds as MembersFinanceCandidateFunds,
        inKind: acc.inKind as MembersFinanceInKind,
        otherReceipts: acc.otherReceipts as MembersFinanceOtherReceipts,
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

    functions.logger.info("scrapeOcpfFinance complete", {
      processed: accumulators.size,
      years: YEARS
    })

    res.status(200).json({
      results: { processed: accumulators.size, years: YEARS }
    })
  })

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
  endBalance: ["end_balance"],
  endDate: ["end_date"]
}

const ITEM_COLUMN_ALIASES: Record<string, string[]> = {
  reportId: ["report_id"],
  recordTypeId: ["record_type_id"],
  amount: ["amount"]
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
  reportIdToMemberCode: Map<number, string>
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
    const endBalance = parseFloat(col(cols, idx.endBalance)) || 0

    let acc = accumulators.get(memberCode)
    if (!acc) {
      acc = newAccumulator(cpfId)
      accumulators.set(memberCode, acc)
    }

    if (YEAR_END_REPORT_TYPE_IDS.has(reportTypeId)) {
      // Annual rollup — skip accumulation to avoid double-counting the periodic
      // totals already summed above. Store for the reconciliation check below.
      if (acc.yearEndCheck[year] === null) {
        acc.yearEndCheck[year] = { receiptsTotal, expendituresTotal }
      }
      matched++
      continue
    }

    // Credit Card (type 80) and Reimbursement (type 90) reports are supplemental:
    // they itemize spending that the depository bank already captured as bank
    // transactions in the monthly Bank Report's Expenditures_Total. Verified
    // empirically — for two members the sum of all Bank Reports matched the
    // Year-End Report exactly without including type 80/90 amounts, confirming
    // their Expenditures_Total is already counted. Their items (354 Credit Card
    // Sub-Items, 351 Reimbursement Sub-Items) are not used by accumulateItem(),
    // so there is no reason to register their report IDs.
    if (reportTypeId === 80 || reportTypeId === 90) {
      matched++
      continue
    }

    reportIdToMemberCode.set(reportId, memberCode)

    // Deposit Reports (type 60) carry gross contribution amounts (before fees).
    // The same money appears net-of-fees in Bank Report (type 70) Receipts_Total,
    // so adding both would double-count. Skip the totals for type 60 but keep
    // its report_id registered (for 201/202/203/204 item-level breakdown) and
    // its unitemized amount (Bank Reports have blank for that field).
    if (reportTypeId !== 60) {
      acc.totalRaised += receiptsTotal
      acc.totalSpent += expendituresTotal
    }
    acc.breakdown.unitemized.amount += receiptsUnitemized

    if (acc.years[year]) {
      if (reportTypeId !== 60) {
        acc.years[year].totalRaised += receiptsTotal
        acc.years[year].totalSpent += expendituresTotal
      }
      acc.years[year].breakdown.unitemized.amount += receiptsUnitemized
    }

    // Report_Type_ID 70 = Bank Report — use End_Balance from the report with the latest End_Date
    const endDate = col(cols, idx.endDate)
    const endDateMs = endDate ? new Date(endDate).getTime() : 0
    if (reportTypeId === 70 && endDateMs > acc.cashOnHandEndDateMs) {
      acc.cashOnHand = endBalance
      acc.cashOnHandEndDateMs = endDateMs
    }
    // Deposit Reports are filed more frequently than Bank Reports, so this
    // date is normally later — tracked to show readers why the Contributions
    // Breakdown (sourced from Deposit Reports) and Total Raised (sourced from
    // Bank Reports) can reflect different "as of" dates.
    if (reportTypeId === 60 && endDateMs > acc.depositEndDateMs) {
      acc.depositEndDateMs = endDateMs
    }

    matched++
  }

  functions.logger.info(`Parsed reports.txt for ${year}`, { matched })
}

async function streamReportItems(
  buf: Buffer,
  reportIdToMemberCode: Map<number, string>,
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
    const amount = parseFloat(col(cols, idx.amount)) || 0

    accumulateItem(acc, recordTypeId, amount, year)
    processed++
  }

  functions.logger.info(`Streamed report-items.txt for ${year}`, {
    processed,
    skipped
  })
}

function accumulateItem(
  acc: MemberAccumulator,
  recordTypeId: number,
  amount: number,
  year: string
): void {
  const addTo = (
    entry: MutableBreakdownEntry,
    alsoYearBreakdown?: MutableBreakdownEntry
  ) => {
    entry.count++
    entry.amount += amount
    if (alsoYearBreakdown) {
      alsoYearBreakdown.count++
      alsoYearBreakdown.amount += amount
    }
  }

  const yb = acc.years[year]?.breakdown

  switch (recordTypeId) {
    case 201: // Individual Contribution
      addTo(acc.breakdown.individual, yb?.individual)
      acc.contributorCount++
      if (amount < 200) {
        addTo(acc.breakdown.smallDonors.itemized, yb?.smallDonors?.itemized)
      }
      break
    case 202: // Committee Contribution
      addTo(acc.breakdown.committee, yb?.committee)
      break
    case 203: // Union/Association Contribution
      addTo(acc.breakdown.union, yb?.union)
      break
    case 204: // Non-contribution receipt
      addTo(acc.otherReceipts.nonContribution)
      break
    case 206: // Candidate Loan
    case 331: // Out-of-pocket expense (as loan)
      addTo(acc.candidateFunds.loans)
      break
    case 332: // Out-of-pocket expense (as contribution)
      addTo(acc.candidateFunds.contributions)
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
      addTo(acc.breakdown.processingFees, yb?.processingFees)
      break
    // 205 (Bank Interest) and 220 (Aggregated un-itemized) come from reports.txt, not items
    default:
      break
  }
}
