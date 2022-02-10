import { logger, runWith } from "firebase-functions"
import * as api from "./malegislature"
import * as admin from "firebase-admin"
import axios, { AxiosError } from "axios"
import { last } from "lodash"

admin.initializeApp()
const db = admin.firestore()

/** The documents in the `/court/_/documents` collection */
type Document = api.Document & { lastFetch: Date }

/** Batch documents trigger the batch fetch function to scrape `documentIds` */
type Batch = {
  court: number
  documentIds: string[]
}

/**
 * ```md
 * k = # days to scrape whole dataset
 * n = # documents in dataset
 * b = # batches per day
 * p = # parallel scrapers
 * d = # documents scraped sequentially per scraper
 *
 * k = n / (b * p * d)
 * b = n / (k * p * d)
 *
 * n ~ 8000
 * d < 100 to stay under 540s execution time limit
 * p < 10 to stay under 10 concurrent requests
 * 1 <= k <= 7
 *
 * ```
 * 8 batches per day, 10 parallel scrapers, 100 documents per scraper will
 * process all documents once per day.
 */

const docsPerBatch = 100,
  batchesPerRun = 10

/**
 * Initiates batches of document scraping. It coordinates scraping using
 * firestore under the `/scrapers` path. Each time it runs, it starts a fixed
 * number of fetch jobs, each with a fixed number of document ids. The fetch
 * jobs run in parallel but individually request resources in sequence. It steps
 * through the bills in alphabetical order and tracks the end of the last batch
 * it triggered. Each time it runs, it starts where it left off. In this way it
 * gradually scrapes all documents. It will loop around the documents, thus
 * keeping them up to date.
 *
 * ```
 * /scrapers/documents: {
 *    lastDocumentId: "HD123"
 *
 *    /batches/{batchId}: {
 *      court: number
 *      documentIds: string[]
 *    }
 * }
 * ```
 */
export const startDocumentBatches = runWith({ timeoutSeconds: 60 })
  .pubsub.schedule("every 3 hours")
  .onRun(async () => {
    const scraper = await db.doc("/scrapers/documents").get(),
      court = api.currentGeneralCourt,
      lastDocumentId = scraper.data()?.lastDocumentId ?? "",
      batchedIds = await chooseBatches({
        court,
        startAfterId: lastDocumentId,
        docsPerBatch,
        numBatches: batchesPerRun
      })

    const writer = db.bulkWriter(),
      batches = scraper.ref.collection("batches")

    // Step the document ID for the next round of batches
    await scraper.ref.set(
      { lastDocumentId: last(last(batchedIds)) },
      { merge: true }
    )

    // Delete old batch documents
    await db.recursiveDelete(batches, writer)

    // Trigger batch execution by writing batch documents
    batchedIds.forEach(documentIds => {
      const batch: Batch = { court, documentIds }
      writer.create(batches.doc(), batch)
    })

    await writer.close()
  })

/**
 * Fetches document content and writes it to firestore for application
 * consumption.
 */
export const fetchDocumentBatch = runWith({ timeoutSeconds: 240 })
  .firestore.document("/scrapers/documents/batches/{batchId}")
  .onCreate(async snap => {
    const batch = snap.data() as Batch,
      court = batch.court,
      writer = db.bulkWriter()

    for (const id of batch.documentIds) {
      try {
        const doc: Document = {
          ...(await api.getDocument({ id, court })),
          lastFetch: new Date()
        }
        writer.set(db.doc(`/generalCourts/${court}/documents/${id}`), doc)
      } catch (e) {
        if (axios.isAxiosError(e)) {
          if (!missingDocument(e)) {
            logger.warn(
              `MALegislature error fetching document ${id}: ${e.message}`
            )
          }
        } else {
          throw e
        }
      }
    }

    await writer.close()
  })

function missingDocument(e: AxiosError) {
  return (
    e.response?.status === 400 &&
    e.response.statusText.includes("The requested Document could not be found")
  )
}

async function chooseBatches({
  court,
  startAfterId,
  docsPerBatch,
  numBatches
}: {
  court: number
  startAfterId: string
  docsPerBatch: number
  numBatches: number
}): Promise<string[][]> {
  const allIds = await api.listDocuments({ court }).then(docs =>
    docs
      .map(d => d.BillNumber!)
      .filter(Boolean)
      .sort()
  )

  const startIndex = allIds.findIndex(id => id > startAfterId),
    count = Math.min(docsPerBatch * numBatches, allIds.length),
    after = allIds.slice(startIndex, startIndex + count),
    wrapped = allIds.slice(0, count - after.length),
    ids = [...after, ...wrapped],
    batchedIds = []

  for (let start = 0; start < ids.length; start += docsPerBatch) {
    batchedIds.push(ids.slice(start, start + docsPerBatch))
  }

  return batchedIds
}
