import { isString } from "lodash"
import { logFetchError } from "../common"
import * as api from "../malegislature"
import { createScraper } from "../scraper"
import { Bill } from "./types"

/**
 * There are around 8000 documents. With 8 batches per day, 20 parallel
 * scrapers, and 50 documents per batch, we will process all documents once per
 * day.
 */
export const { fetchBatch: fetchBillBatch, startBatches: startBillBatches } =
  createScraper({
    resourceName: "bills",
    batchesPerRun: 20,
    resourcesPerBatch: 50,
    startBatchSchedule: "every 3 hours",
    fetchBatchTimeout: 240,
    startBatchTimeout: 60,
    fetchResource: async (court: number, id: string) => {
      const content = await api.getDocument({ id, court })
      const history = await api
        .getBillHistory(court, id)
        .catch(logFetchError("bill history", id))
        .then(history => history ?? [])
      // Most of our time is spent fetching similar bills
      const similar = await api
        .getSimilarBills(court, id)
        .catch(logFetchError("similar bills", id))
        .then(bills => bills?.map(b => b.BillNumber).filter(isString) ?? [])
      const resource: Partial<Bill> = {
        content,
        history,
        similar,
        cosponsorCount: content.Cosponsors.length
      }

      return resource
    },
    listIds: (court: number) =>
      api.listDocuments({ court }).then(docs => docs.map(d => d.BillNumber))
  })
