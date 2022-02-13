import * as api from "./malegislature"
import { createScraper } from "./scraper"

/**
 * There are around 200 members, whom we scrape every day.
 */
export const {
  fetchBatch: fetchLegislativeMemberBatch,
  startBatches: startLegislativeMemberBatches
} = createScraper({
  resourceName: "legislativeMembers",
  batchesPerRun: 10,
  resourcesPerBatch: 100,
  startBatchSchedule: "every 24 hours",
  fetchBatchTimeout: 240,
  startBatchTimeout: 60,
  fetchResource: (court: number, id: string) => api.getMember({ id, court }),
  listIds: (court: number) =>
    api.listMembers({ court }).then(members => members.map(m => m.MemberCode))
})
