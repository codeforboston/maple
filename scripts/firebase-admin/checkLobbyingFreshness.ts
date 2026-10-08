import { Script } from "./types"

export const script: Script = async ({ db }) => {
  const filingsSnap = await db
    .collection("lobbyingFilings")
    .orderBy("fetchedAt", "desc")
    .limit(5)
    .get()

  console.log(`lobbyingFilings: most recently fetched docs`)
  filingsSnap.docs.forEach(doc => {
    const d = doc.data()
    console.log(
      `  fetchedAt=${d.fetchedAt?.toDate?.()?.toISOString()} year=${
        d.year
      } gc=${d.generalCourt} entity=${d.entityName}`
    )
  })

  const registrantsSnap = await db
    .collection("lobbyingRegistrants")
    .orderBy("fetchedAt", "desc")
    .limit(5)
    .get()

  console.log(`\nlobbyingRegistrants: most recently fetched docs`)
  registrantsSnap.docs.forEach(doc => {
    const d = doc.data()
    console.log(
      `  fetchedAt=${d.fetchedAt?.toDate?.()?.toISOString()} year=${
        d.year
      } entity=${d.entityName}`
    )
  })

  const scraperDoc = await db.doc("scrapers/lobbying").get()
  console.log(`\nscrapers/lobbying doc exists: ${scraperDoc.exists}`)
  const processedUrlsSnap = await db
    .collection("scrapers/lobbying/processedUrls")
    .get()
  const summaryCacheSnap = await db
    .collection("scrapers/lobbying/summaryCache")
    .get()
  console.log(`  processedUrls subcollection: ${processedUrlsSnap.size} URLs`)
  console.log(
    `  summaryCache subcollection: ${summaryCacheSnap.size} registrant summaries cached`
  )

  const backfillDoc = await db.doc("scrapers/lobbyingBackfill").get()
  console.log(`\nscrapers/lobbyingBackfill doc exists: ${backfillDoc.exists}`)
  if (backfillDoc.exists) {
    console.log(`  completedYears: ${backfillDoc.data()?.completedYears}`)
  }

  const currentYear = new Date().getFullYear()
  const yRegistrants = await db
    .collection("lobbyingRegistrants")
    .where("year", "==", currentYear)
    .get()
  const yFilings = await db
    .collection("lobbyingFilings")
    .where("year", "==", currentYear)
    .get()
  console.log(
    `\n${currentYear}: ${yRegistrants.size} registrants, ${yFilings.size} filings`
  )

  // Grand totals come from the last computed stats doc rather than a live
  // full-collection scan — cheap, and the corpus (300K+ docs) makes an
  // aggregate scan here wasteful for what's meant to be a quick check.
  const statsDoc = await db.doc("lobbyingMeta/stats").get()
  const stats = statsDoc.data()
  console.log(
    `\nlobbyingMeta/stats (as of last compute): ${
      stats?.totalFilings ?? "?"
    } filings, ${stats?.totalRegistrants ?? "?"} registrants`
  )
}
