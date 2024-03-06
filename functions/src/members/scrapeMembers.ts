import * as api from "../malegislature"
import { createScraper } from "../scraper"

/**
 * There are around 200 members, whom we scrape every day.
 *
 * The member record lists all bills they are a sponsor or cosponsor of, and
 * each of those objects list all sponsors and cosponsors. So late in the court,
 * the responses are **huge**.
 */
export const {
  fetchBatch: fetchMemberBatch,
  startBatches: startMemberBatches
} = createScraper({
  resourceName: "members",
  batchesPerRun: 20,
  resourcesPerBatch: 5,
  startBatchSchedule: "every 8 hours",
  fetchBatchTimeout: 300,
  startBatchTimeout: 60,
  fetchResource: async (court: number, id: string) => ({
    content: await api.getMember({ id, court })
  }),
  listIds: (court: number) =>
    api.listMembers({ court }).then(members => members.map(m => m.MemberCode))
})
