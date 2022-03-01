import { pubsub } from "firebase-functions"
import { db } from "./firebase"
import * as api from "./malegislature"
import { createScraper } from "./scraper"

/**
 * There are around 200 members, whom we scrape every day.
 */
export const {
  fetchBatch: fetchMemberBatch,
  startBatches: startMemberBatches
} = createScraper({
  resourceName: "members",
  batchesPerRun: 10,
  resourcesPerBatch: 100,
  startBatchSchedule: "every 24 hours",
  fetchBatchTimeout: 240,
  startBatchTimeout: 60,
  fetchResource: async (court: number, id: string) => ({
    content: await api.getMember({ id, court })
  }),
  listIds: (court: number) =>
    api.listMembers({ court }).then(members => members.map(m => m.MemberCode))
})

/** Create a document that aggregates all legislative members for easier
 * searching on the client.  */
export const createMemberSearchIndex = pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    const members = await db
      .collection(`/generalCourts/${api.currentGeneralCourt}/members`)
      .get()

    const index = members.docs
      .map(d => (d.exists && d.data().content) ?? {})
      .filter(Boolean)
      .map(({ Branch, District, EmailAddress, MemberCode, Name, Party }) => ({
        Branch,
        District,
        EmailAddress,
        MemberCode,
        Name,
        Party
      }))
      .sort((m1, m2) => (m1.Name < m2.Name ? -1 : 1))

    await db
      .doc(`/generalCourts/${api.currentGeneralCourt}/indexes/memberSearch`)
      .set({
        representatives: index.filter(d => d.Branch === "House"),
        senators: index.filter(d => d.Branch === "Senate")
      })
  })
