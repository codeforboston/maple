import axios, { AxiosError } from "axios"
import { logger, runWith } from "firebase-functions"
import { last } from "lodash"
import { db, FieldValue } from "./firebase"
import { currentGeneralCourt } from "../../common/constants"
import { Timestamp } from "../../common/types"
import { DocumentData } from "firebase-admin/firestore"

/** Batch documents trigger the batch fetch function to scrape `ids` */
type Batch = {
  court: number
  ids: string[]
}

/** List all ids of the resources to scrape. Falsey values will be filtered out.
 */
type ListIds = (court: number) => Promise<(string | undefined | null)[]>

/** Fetch the given resource for the given court. */
type FetchResource<T> = (
  court: number,
  id: string,
  current?: DocumentData
) => Promise<T>

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
 * n ~ 8000 for bills
 * d < 100 to stay under 540s execution time limit
 * p < 10 to stay under 10 concurrent requests
 * 1 <= k <= 7
 *
 * ```
 *
 * Handles batches of document scraping. It coordinates scraping using firestore
 * under the `/scrapers` path. Each time it runs, it starts a fixed number of
 * fetch jobs, each with a fixed number of document ids. The fetch jobs run in
 * parallel but individually request resources in sequence. It steps through the
 * bills in alphabetical order and tracks the end of the last batch it
 * triggered. Each time it runs, it starts where it left off. In this way it
 * gradually scrapes all documents. It will loop around the documents, thus
 * keeping them up to date.
 *
 * ```
 * /scrapers/documents: {
 *    lastId: "HD123"
 *
 *    /batches/{batchId}: {
 *      court: number
 *      documentIds: string[]
 *    }
 * }
 * ```
 */
export function createScraper<T>({
  resourceName,
  listIds,
  fetchResource,
  startBatchSchedule,
  resourcesPerBatch,
  batchesPerRun,
  startBatchTimeout,
  fetchBatchTimeout
}: {
  resourceName: string
  listIds: ListIds
  fetchResource: FetchResource<T>
  startBatchSchedule: string
  startBatchTimeout: number
  fetchBatchTimeout: number
  resourcesPerBatch: number
  batchesPerRun: number
}) {
  const startBatches = runWith({ timeoutSeconds: startBatchTimeout })
    .pubsub.schedule(startBatchSchedule)
    .onRun(async () => {
      const scraper = await db.doc(`/scrapers/${resourceName}`).get(),
        lastId = scraper.data()?.lastId ?? "",
        court = currentGeneralCourt,
        ids = await listIds(court),
        batchedIds = chooseBatches({
          startAfterId: lastId,
          docsPerBatch: resourcesPerBatch,
          numBatches: batchesPerRun,
          ids
        })

      const writer = db.bulkWriter(),
        batches = scraper.ref.collection("batches")

      // Step the document ID for the next round of batches
      await scraper.ref.set({ lastId: last(last(batchedIds)) }, { merge: true })

      // Delete old batch documents
      await db.recursiveDelete(batches, writer)

      // Trigger batch execution by writing batch documents
      batchedIds.forEach(ids => {
        const batch: Batch = { court, ids }
        writer.create(batches.doc(), batch)
      })

      await writer.close()
    })

  /**
   * Fetches document content and writes it to firestore for application
   * consumption.
   */
  const fetchBatch = runWith({ timeoutSeconds: fetchBatchTimeout })
    .firestore.document(`/scrapers/${resourceName}/batches/{batchId}`)
    .onCreate(async snap => {
      const batch = snap.data() as Batch,
        court = batch.court,
        writer = db.bulkWriter()

      for (const id of batch.ids) {
        try {
          const path = `/generalCourts/${court}/${resourceName}/${id}`
          const current = await db.doc(path).get()
          const resource = await fetchResource(court, id, current.data())

          writer.set(
            db.doc(path),
            {
              ...resource,
              fetchedAt: Timestamp.now(),
              lastFetch: FieldValue.delete(),
              id,
              court
            },
            { merge: true }
          )
        } catch (e) {
          if (axios.isAxiosError(e)) {
            if (!missingResource(e)) {
              logger.warn(
                `Could not fetch resource ${resourceName}/${id}: ${e.message}`
              )
            }
          } else {
            throw e
          }
        }
      }

      await writer.close()
    })

  return { startBatches, fetchBatch }
}

function missingResource(e: AxiosError) {
  return (
    e.response?.status === 400 &&
    !!e.response.statusText.match(/the requested .* could not be found/i)
  )
}

export function chooseBatches({
  startAfterId,
  docsPerBatch,
  numBatches,
  ids: rawIds
}: {
  startAfterId: string
  docsPerBatch: number
  numBatches: number
  ids: (string | undefined | null)[]
}): string[][] {
  const allIds = rawIds.filter(Boolean).sort() as string[],
    startIndex = allIds.findIndex(id => id > startAfterId),
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
