import { pubsub } from "firebase-functions"
import { db } from "../firebase"
import { currentGeneralCourt } from "../../../common/constants"

/** Create a document that aggregates all legislative members for easier
 * searching on the client.  */
export const createMemberSearchIndex = pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    const members = await db
      .collection(`/generalCourts/${currentGeneralCourt}/members`)
      .get()

    const index = members.docs
      .map(d => (d.exists && d.data().content) ?? {})
      .filter(Boolean)
      // Strip out sponsored and cosponsored bills for size
      .map(({ SponsoredBills, CoSponsoredBills, ...member }) => member)
      .sort((m1, m2) => (m1.Name < m2.Name ? -1 : 1))

    await db
      .doc(`/generalCourts/${currentGeneralCourt}/indexes/memberSearch`)
      .set({
        representatives: index.filter(d => d.Branch === "House"),
        senators: index.filter(d => d.Branch === "Senate")
      })
  })
