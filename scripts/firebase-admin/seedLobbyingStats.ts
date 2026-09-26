import { Script } from "./types"

type PositionKey = "support" | "oppose" | "neutral" | "none"
type BillCounts = {
  total: number
  support: number
  oppose: number
  neutral: number
  none: number
  title: string
  clients: number
  lobbyists: number
}

function normalizePosition(raw: string | undefined): PositionKey {
  if (!raw) return "none"
  const s = raw.toLowerCase().trim()
  if (s.startsWith("support")) return "support"
  if (s.startsWith("oppose") || s.startsWith("against")) return "oppose"
  if (s.startsWith("neutral") || s.startsWith("monitor")) return "neutral"
  return "none"
}

const FILINGS_COLLECTION = "lobbyingFilings"
const REGISTRANTS_COLLECTION = "lobbyingRegistrants"
const STATS_COLLECTION = "lobbyingMeta"
const STATS_DOC_ID = "stats"

// Sentinel clientName used for pre-2013 legacy filings where compensation is
// reported as a single total rather than broken down per client. Must match
// LEGACY_TOTAL_CLIENT in functions/src/lobbying/types.ts.
const LEGACY_TOTAL_CLIENT = "_total_salary_"

function isLegacyTotalClient(
  name: string | undefined,
  nameNorm: string | undefined
): boolean {
  if (!nameNorm || nameNorm === LEGACY_TOTAL_CLIENT) return true
  if (name === LEGACY_TOTAL_CLIENT) return true
  const lc = (name ?? "").toLowerCase()
  return lc.includes("total salaries") || lc.includes("total salary")
}

type FirmBreakdownEntry = {
  entityName: string
  entityNameNorm: string
  compensation: number | null
  years: number[]
}

type ClientSummary = {
  clientName: string
  clientNameNorm: string
  totalCompensation: number | null
  registrantCount: number
  firms: FirmBreakdownEntry[]
}

type FirmSummary = {
  entityName: string
  entityNameNorm: string
  regType: string
  years: number[]
  clientCount: number
}

export const script: Script = async ({ db }) => {
  console.log("Reading lobbyingFilings…")
  const filingsSnap = await db.collection(FILINGS_COLLECTION).get()
  console.log(`  ${filingsSnap.size} filings`)

  console.log("Reading lobbyingRegistrants…")
  const registrantsSnap = await db.collection(REGISTRANTS_COLLECTION).get()
  console.log(`  ${registrantsSnap.size} registrants`)

  const bills = new Set<string>()
  const courts = new Set<number>()
  const filingsByYear: Record<string, number> = {}
  const entityFilingCounts: Record<string, number> = {}
  const clientFilingCounts: Record<string, number> = {}
  const billSummaries: Record<number, Record<string, BillCounts>> = {}
  const billClientSets: Record<number, Record<string, Set<string>>> = {}
  const billEntitySets: Record<number, Record<string, Set<string>>> = {}

  for (const doc of filingsSnap.docs) {
    const d = doc.data()
    const year: number = d.year
    const gc: number = d.generalCourt

    if (d.billId && d.billId.length > 2) {
      bills.add(`${gc}/${d.billId}`)
      const pos = normalizePosition(d.position)
      if (!billSummaries[gc]) {
        billSummaries[gc] = {}
        billClientSets[gc] = {}
        billEntitySets[gc] = {}
      }
      if (!billSummaries[gc][d.billId]) {
        billSummaries[gc][d.billId] = {
          total: 0,
          support: 0,
          oppose: 0,
          neutral: 0,
          none: 0,
          title: d.activityTitle ?? "",
          clients: 0,
          lobbyists: 0
        }
        billClientSets[gc][d.billId] = new Set()
        billEntitySets[gc][d.billId] = new Set()
      }
      billSummaries[gc][d.billId].total++
      billSummaries[gc][d.billId][pos]++
      if (d.clientNameNorm) billClientSets[gc][d.billId].add(d.clientNameNorm)
      if (d.entityNameNorm) billEntitySets[gc][d.billId].add(d.entityNameNorm)
    }

    courts.add(gc)

    const y = String(year)
    filingsByYear[y] = (filingsByYear[y] ?? 0) + 1

    if (d.entityNameNorm) {
      entityFilingCounts[d.entityNameNorm] =
        (entityFilingCounts[d.entityNameNorm] ?? 0) + 1
    }
    if (d.clientNameNorm) {
      clientFilingCounts[d.clientNameNorm] =
        (clientFilingCounts[d.clientNameNorm] ?? 0) + 1
    }
  }

  // Fill in client/lobbyist counts from the sets
  for (const [gcStr, billsMap] of Object.entries(billSummaries)) {
    const gc = Number(gcStr)
    for (const [billId, counts] of Object.entries(billsMap)) {
      counts.clients = billClientSets[gc]?.[billId]?.size ?? 0
      counts.lobbyists = billEntitySets[gc]?.[billId]?.size ?? 0
    }
  }

  // Aggregate spend and unique clients from registrant docs.
  // Registrant clients[].compensation is the annual total paid per client
  // relationship — more accurate than the per-bill amount on filings.
  //
  // Also builds per-client and per-firm rollups here (over the full
  // registrants collection) instead of leaving the frontend to derive them
  // client-side, which previously only fetched the first 2,000 of 25,000+
  // registrant docs (Firestore query limit) — silently showing an
  // incomplete client/firm list. See pages/lobbying/clients/index.tsx and
  // pages/lobbying/firms/index.tsx.
  const clientNorms = new Set<string>()
  const spendByYear: Record<string, number> = {}
  // (entityNameNorm, year) pairs, not a raw doc count: a registrant can have
  // multiple docs (one per filing period) sharing the same entity+year, and
  // this stat is shown to users as "Lobbying Firms" — it must count distinct
  // firm-year registrations, not filing periods.
  const registrantKeys = new Set<string>()
  const clientSummaries: Record<
    string,
    ClientSummary & { firmsMap: Record<string, FirmBreakdownEntry> }
  > = {}
  const firmSummaries: Record<
    string,
    FirmSummary & { clientNormsSet: Set<string> }
  > = {}

  for (const doc of registrantsSnap.docs) {
    const d = doc.data()
    const year: number | undefined = d.year
    const y = String(year)
    const entityName: string | undefined = d.entityName
    const entityNorm: string | undefined = d.entityNameNorm
    const regType: string | undefined = d.regType
    const clients = d.clients ?? []

    if (entityNorm) {
      if (!firmSummaries[entityNorm]) {
        firmSummaries[entityNorm] = {
          entityName: entityName ?? entityNorm,
          entityNameNorm: entityNorm,
          regType: regType ?? "",
          years: [],
          clientCount: 0,
          clientNormsSet: new Set()
        }
      }
      const firm = firmSummaries[entityNorm]
      if (year != null && !firm.years.includes(year)) firm.years.push(year)
      if (regType) firm.regType = regType
    }

    for (const c of clients) {
      const norm: string | undefined = c.clientNameNorm
      const name: string | undefined = c.clientName
      const comp: number | null | undefined = c.compensation

      if (comp != null) {
        spendByYear[y] = (spendByYear[y] ?? 0) + comp
      }

      if (isLegacyTotalClient(name, norm)) continue
      if (!norm) continue

      clientNorms.add(norm)
      if (entityNorm) {
        // A set, not a running sum of clients.length: a registrant can now
        // have multiple docs (one per filing period) for the same
        // entity+year, and this is shown to users as "Clients represented"
        // — it must count distinct clients, not filing periods or repeat
        // appearances across years.
        firmSummaries[entityNorm].clientNormsSet.add(norm)
      }

      if (!clientSummaries[norm]) {
        clientSummaries[norm] = {
          clientName: name ?? norm,
          clientNameNorm: norm,
          totalCompensation: null,
          registrantCount: 0,
          firms: [],
          firmsMap: {}
        }
      }
      const cs = clientSummaries[norm]
      if (comp != null) {
        cs.totalCompensation = (cs.totalCompensation ?? 0) + comp
      }

      if (entityNorm) {
        if (!cs.firmsMap[entityNorm]) {
          cs.firmsMap[entityNorm] = {
            entityName: entityName ?? entityNorm,
            entityNameNorm: entityNorm,
            compensation: null,
            years: []
          }
        }
        const fb = cs.firmsMap[entityNorm]
        if (comp != null) {
          fb.compensation = (fb.compensation ?? 0) + comp
        }
        if (year != null && !fb.years.includes(year)) fb.years.push(year)
      }
    }
    if (d.entityNameNorm) registrantKeys.add(`${d.entityNameNorm}|${y}`)
  }

  for (const cs of Object.values(clientSummaries)) {
    for (const fb of Object.values(cs.firmsMap)) {
      fb.years.sort((a, b) => b - a)
    }
    cs.firms = Object.values(cs.firmsMap).sort((a, b) => {
      const aLatest = a.years[0] ?? 0
      const bLatest = b.years[0] ?? 0
      if (aLatest !== bLatest) return bLatest - aLatest
      return a.entityNameNorm.localeCompare(b.entityNameNorm)
    })
    // A count of distinct firms (cs.firms is already deduped by
    // entityNameNorm), not a running per-doc count — same period-doc
    // inflation concern as firm clientCount above. Labeled "Lobbyists" on
    // the clients page.
    cs.registrantCount = cs.firms.length
  }
  for (const fs of Object.values(firmSummaries)) {
    fs.clientCount = fs.clientNormsSet.size
    fs.years.sort((a, b) => b - a)
  }

  const totalClients = clientNorms.size

  const stats = {
    totalFilings: filingsSnap.size,
    totalRegistrants: registrantKeys.size,
    totalClients,
    totalBillsWithFilings: bills.size,
    courtsWithData: [...courts].sort((a, b) => a - b),
    spendByYear,
    filingsByYear
  }

  console.log("Stats computed:")
  console.log(`  totalFilings:          ${stats.totalFilings}`)
  console.log(`  totalRegistrants:      ${stats.totalRegistrants}`)
  console.log(`  totalClients:          ${stats.totalClients}`)
  console.log(`  totalBillsWithFilings: ${stats.totalBillsWithFilings}`)
  console.log(`  courts:                ${stats.courtsWithData.join(", ")}`)

  await db
    .collection(STATS_COLLECTION)
    .doc(STATS_DOC_ID)
    .set(stats, { merge: true })

  await db
    .collection(STATS_COLLECTION)
    .doc("entityFilingCounts")
    .set(entityFilingCounts)

  await db
    .collection(STATS_COLLECTION)
    .doc("clientFilingCounts")
    .set(clientFilingCounts)

  for (const [court, billsMap] of Object.entries(billSummaries)) {
    // One small doc per bill, not one JSON blob per court: a court's blob
    // eventually exceeds Firestore's 1MB field-size limit as its session
    // accumulates filings (hit at 1,057KB for court 194 with ~5,600 bills).
    // Per-bill docs have no such ceiling.
    const parentRef = db
      .collection(STATS_COLLECTION)
      .doc(`billSummaries_${court}`)
    const entries = Object.entries(billsMap)
    await parentRef.set({
      billCount: entries.length,
      updatedAt: new Date().toISOString()
    })
    const billsColl = parentRef.collection("bills")
    for (let i = 0; i < entries.length; i += 400) {
      const batch = db.batch()
      for (const [billId, counts] of entries.slice(i, i + 400)) {
        batch.set(billsColl.doc(billId), counts)
      }
      await batch.commit()
    }
  }

  // Client and firm summaries: same one-small-doc-per-item subcollection
  // pattern as billSummaries above (avoids the 1MB per-document/field limit
  // — at ~5,300 clients and ~4,800 firms this is already close to that
  // ceiling as a single blob/map). Doc IDs are encodeURIComponent(norm), so
  // the frontend can look up one client/firm directly without fetching the
  // whole subcollection.
  const clientParentRef = db.collection(STATS_COLLECTION).doc("clientSummaries")
  const clientEntries = Object.entries(clientSummaries)
  await clientParentRef.set({
    count: clientEntries.length,
    updatedAt: new Date().toISOString()
  })
  const clientsColl = clientParentRef.collection("clients")
  for (let i = 0; i < clientEntries.length; i += 400) {
    const batch = db.batch()
    for (const [norm, { firmsMap: _firmsMap, ...cs }] of clientEntries.slice(
      i,
      i + 400
    )) {
      batch.set(clientsColl.doc(encodeURIComponent(norm)), cs)
    }
    await batch.commit()
  }

  const firmParentRef = db.collection(STATS_COLLECTION).doc("firmSummaries")
  const firmEntries = Object.entries(firmSummaries)
  await firmParentRef.set({
    count: firmEntries.length,
    updatedAt: new Date().toISOString()
  })
  const firmsColl = firmParentRef.collection("firms")
  for (let i = 0; i < firmEntries.length; i += 400) {
    const batch = db.batch()
    for (const [
      norm,
      { clientNormsSet: _clientNormsSet, ...fs }
    ] of firmEntries.slice(i, i + 400)) {
      batch.set(firmsColl.doc(encodeURIComponent(norm)), fs)
    }
    await batch.commit()
  }

  console.log(`Written to ${STATS_COLLECTION}/${STATS_DOC_ID}`)
  console.log(
    `  clientSummaries: ${clientEntries.length}, firmSummaries: ${firmEntries.length}`
  )
  console.log(
    `  entityFilingCounts: ${Object.keys(entityFilingCounts).length} entities`
  )
  console.log(
    `  clientFilingCounts: ${
      Object.keys(clientFilingCounts).length
    } client norms`
  )
  console.log(
    `  billSummaries: ${
      Object.keys(billSummaries).length
    } courts (${Object.keys(billSummaries).join(", ")})`
  )
}
