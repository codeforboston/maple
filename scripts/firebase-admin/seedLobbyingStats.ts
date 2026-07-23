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
  const clientNorms = new Set<string>()
  const spendByYear: Record<string, number> = {}
  for (const doc of registrantsSnap.docs) {
    const d = doc.data()
    const y = String(d.year)
    for (const c of d.clients ?? []) {
      if (c.clientNameNorm) clientNorms.add(c.clientNameNorm)
      if (c.compensation != null) {
        spendByYear[y] = (spendByYear[y] ?? 0) + c.compensation
      }
    }
  }
  const totalClients = clientNorms.size

  const stats = {
    totalFilings: filingsSnap.size,
    totalRegistrants: registrantsSnap.size,
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
    await db
      .collection(STATS_COLLECTION)
      .doc(`billSummaries_${court}`)
      .set({ data: JSON.stringify(billsMap) })
  }

  console.log(`Written to ${STATS_COLLECTION}/${STATS_DOC_ID}`)
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
