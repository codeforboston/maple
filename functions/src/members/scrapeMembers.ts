import * as api from "../malegislature"
import { createScraper } from "../scraper"

/**
 * There are around 200 members, whom we scrape every day.
 */
export const {
  fetchBatch: fetchMemberBatch,
  startBatches: startMemberBatches
} = createScraper({
  resourceName: "members",
  batchesPerRun: 10,
  resourcesPerBatch: 10,
  startBatchSchedule: "every 24 hours",
  fetchBatchTimeout: 7200,
  startBatchTimeout: 240,
  fetchResource: async (court: number, id: string) => ({
    content: await api.getMember({ id, court })
  }),
  listIds: (court: number) =>
    api.listMembers({ court }).then(members => members.map(m => m.MemberCode))
})
