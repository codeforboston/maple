import * as api from "../malegislature"
import { createScraper } from "../scraper"

/**
 * There are around 8000 documents. With 8 batches per day, 10 parallel
 * scrapers, and 100 documents per batch, we will process all documents once per
 * day.
 */
export const { fetchBatch: fetchBillBatch, startBatches: startBillBatches } =
  createScraper({
    resourceName: "bills",
    batchesPerRun: 10,
    resourcesPerBatch: 100,
    startBatchSchedule: "every 3 hours",
    fetchBatchTimeout: 240,
    startBatchTimeout: 60,
    fetchResource: async (court: number, id: string) => {
      const content = await api.getDocument({ id, court })
      const history = await api.getBillHistory(court, id)
      return {
        content,
        history,
        cosponsorCount: content.Cosponsors.length
      }
    },
    listIds: (court: number) =>
      api.listDocuments({ court }).then(docs => docs.map(d => d.BillNumber))
  })
