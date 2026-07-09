import { Script } from "./types"

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

  const entityNames = new Set<string>()
  const clientNames = new Set<string>()
  const bills = new Set<string>()
  const courts = new Set<number>()
  const spendByYear: Record<string, number> = {}
  const filingsByYear: Record<string, number> = {}

  for (const doc of filingsSnap.docs) {
    const d = doc.data()
    const year: number = d.year
    const gc: number = d.generalCourt

    entityNames.add(d.entityNameNorm ?? d.entityName)

    if (d.clientNameNorm) clientNames.add(d.clientNameNorm)

    if (d.billId && d.billId.length > 2) {
      bills.add(`${gc}/${d.billId}`)
    }

    courts.add(gc)

    const y = String(year)
    filingsByYear[y] = (filingsByYear[y] ?? 0) + 1
    if (d.amount != null) {
      spendByYear[y] = (spendByYear[y] ?? 0) + d.amount
    }
  }

  // Also count unique clients from registrant docs (more reliable than filings)
  const clientNormsFromRegistrants = new Set<string>()
  for (const doc of registrantsSnap.docs) {
    const d = doc.data()
    for (const c of d.clients ?? []) {
      if (c.clientNameNorm) clientNormsFromRegistrants.add(c.clientNameNorm)
    }
  }
  // Use whichever source gives more clients
  const totalClients = Math.max(
    clientNames.size,
    clientNormsFromRegistrants.size
  )

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

  console.log(`Written to ${STATS_COLLECTION}/${STATS_DOC_ID}`)
}
