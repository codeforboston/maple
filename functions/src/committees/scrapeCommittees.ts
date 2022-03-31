import * as api from "../malegislature"
import { createScraper } from "../scraper"

/**
 * There are around 55 committees, which we scrape every day.
 */
export const {
  fetchBatch: fetchCommitteeBatch,
  startBatches: startCommitteeBatches
} = createScraper({
  resourceName: "committees",
  batchesPerRun: 10,
  resourcesPerBatch: 100,
  startBatchSchedule: "every 24 hours",
  fetchBatchTimeout: 240,
  startBatchTimeout: 60,
  fetchResource: async (court: number, id: string) => {
    const content = await api.getCommittee(court, id)
    return { content }
  },
  listIds: (court: number) =>
    api.listCommittees(court).then(c => c.map(c => c.CommitteeCode))
})
