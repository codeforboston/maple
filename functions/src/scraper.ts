import axios, { AxiosError } from "axios"
import { logger } from "firebase-functions"
import { onDocumentCreated } from "firebase-functions/v2/firestore"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { last } from "lodash"
import { db, DocumentData, FieldValue, Timestamp } from "./firebase"
import { currentGeneralCourt } from "./shared"
import {
  chooseBatches,
  isRefreshCycleComplete,
  selectBatchRun
} from "./scraperBatching"

export { chooseBatches } from "./scraperBatching"

/** Batch documents trigger the batch fetch function to scrape `ids` */
type Batch = {
  court: number
  ids: string[]
  cycleId?: number
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
  fetchBatchTimeout,
  trackFullRefresh = false
}: {
  resourceName: string
  listIds: ListIds
  fetchResource: FetchResource<T>
  startBatchSchedule: string
  startBatchTimeout: number
  fetchBatchTimeout: number
  resourcesPerBatch: number
  batchesPerRun: number
  trackFullRefresh?: boolean
}) {
  const startBatches = onSchedule(
    { schedule: startBatchSchedule, timeoutSeconds: startBatchTimeout },
    async () => {
      const scraperRef = db.doc(`/scrapers/${resourceName}`)
      const court = currentGeneralCourt
      const ids = await listIds(court)

      if (trackFullRefresh) {
        await startTrackedBatchRun({
          scraperRef,
          resourceName,
          court,
          ids,
          docsPerBatch: resourcesPerBatch,
          numBatches: batchesPerRun
        })
        return
      }

      const scraper = await scraperRef.get()
      const batchedIds = chooseBatches({
        startAfterId: scraper.data()?.lastId ?? "",
        docsPerBatch: resourcesPerBatch,
        numBatches: batchesPerRun,
        ids
      })
      const writer = db.bulkWriter()
      const batches = scraperRef.collection("batches")

      await scraperRef.set({ lastId: last(last(batchedIds)) }, { merge: true })
      await db.recursiveDelete(batches, writer)

      batchedIds.forEach(ids => {
        const batch: Batch = { court, ids }
        writer.create(batches.doc(), batch)
      })

      await writer.close()
    }
  )

  /**
   * Fetches document content and writes it to firestore for application
   * consumption.
   */
  const fetchBatch = onDocumentCreated(
    {
      document: `/scrapers/${resourceName}/batches/{batchId}`,
      timeoutSeconds: fetchBatchTimeout,
      retry: trackFullRefresh
    },
    async event => {
      const snap = event.data
      if (!snap) return

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
              if (trackFullRefresh) throw e
            }
          } else {
            throw e
          }
        }
      }

      await writer.close()

      if (trackFullRefresh && batch.cycleId !== undefined) {
        await completeTrackedBatch({
          scraperRef: db.doc(`/scrapers/${resourceName}`),
          batchRef: snap.ref,
          completedCycleRef: db.doc(
            `/scrapers/${resourceName}/completedCycles/${batch.cycleId}`
          ),
          cycleId: batch.cycleId,
          court
        })
      }
    }
  )

  return { startBatches, fetchBatch }
}

async function startTrackedBatchRun({
  scraperRef,
  resourceName,
  court,
  ids,
  docsPerBatch,
  numBatches
}: {
  scraperRef: FirebaseFirestore.DocumentReference
  resourceName: string
  court: number
  ids: (string | undefined | null)[]
  docsPerBatch: number
  numBatches: number
}) {
  const batchCollection = scraperRef.collection("batches")

  await db.runTransaction(async transaction => {
    const scraperSnapshot = await transaction.get(scraperRef)
    const state = scraperSnapshot.data() ?? {}
    let cycleId = typeof state.cycleId === "number" ? state.cycleId : 1
    let expectedBatches =
      typeof state.expectedBatches === "number" ? state.expectedBatches : 0
    let completedBatches =
      typeof state.completedBatches === "number" ? state.completedBatches : 0
    let cycleClosed = state.cycleClosed === true

    if (cycleClosed) {
      if (completedBatches < expectedBatches) return
      cycleId += 1
      expectedBatches = 0
      completedBatches = 0
      cycleClosed = false
    }

    const selection = selectBatchRun({
      startAfterId: typeof state.lastId === "string" ? state.lastId : "",
      docsPerBatch,
      numBatches,
      ids
    })
    if (selection.batches.length === 0) return

    selection.batches.forEach(batchIds => {
      transaction.create(batchCollection.doc(), {
        court,
        ids: batchIds,
        cycleId
      })
    })

    transaction.set(
      scraperRef,
      {
        lastId: selection.nextLastId,
        cycleId,
        expectedBatches: expectedBatches + selection.batches.length,
        completedBatches,
        cycleClosed: selection.cycleComplete
      },
      { merge: true }
    )
  })
}

async function completeTrackedBatch({
  scraperRef,
  batchRef,
  completedCycleRef,
  cycleId,
  court
}: {
  scraperRef: FirebaseFirestore.DocumentReference
  batchRef: FirebaseFirestore.DocumentReference
  completedCycleRef: FirebaseFirestore.DocumentReference
  cycleId: number
  court: number
}) {
  await db.runTransaction(async transaction => {
    const [batchSnapshot, scraperSnapshot] = await Promise.all([
      transaction.get(batchRef),
      transaction.get(scraperRef)
    ])
    if (!batchSnapshot.exists) return

    const state = scraperSnapshot.data() ?? {}
    const completedBatches =
      (typeof state.completedBatches === "number"
        ? state.completedBatches
        : 0) + 1
    const expectedBatches =
      typeof state.expectedBatches === "number" ? state.expectedBatches : 0
    const cycleClosed = state.cycleClosed === true

    transaction.delete(batchRef)
    transaction.set(scraperRef, { completedBatches }, { merge: true })

    if (
      isRefreshCycleComplete({
        cycleClosed,
        completedBatches,
        expectedBatches
      })
    ) {
      transaction.create(completedCycleRef, { court, cycleId })
    }
  })
}

function missingResource(e: AxiosError) {
  return (
    e.response?.status === 400 &&
    !!e.response.statusText.match(/the requested .* could not be found/i)
  )
}
