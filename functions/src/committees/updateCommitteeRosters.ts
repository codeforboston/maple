import { runWith } from "firebase-functions"
import { DocUpdate } from "../common"
import { db } from "../firebase"
import { Member } from "../members/types"
import { Committee } from "./types"
import { currentGeneralCourt } from "../../../common/constants"

/** Updates the list of members in each committee.  */
export const updateCommitteeRosters = runWith({ timeoutSeconds: 120 })
  .pubsub.schedule("every 24 hours")
  .onRun(async () => {
    const members = await db
      .collection(`/generalCourts/${currentGeneralCourt}/members`)
      .get()
      .then(c => c.docs.map(d => d.data()).filter(Member.guard))
    const rosters = computeRosters(members)

    const writer = db.bulkWriter()
    rosters.forEach((roster, id) => {
      const update: DocUpdate<Committee> = {
        members: roster.map(m => ({ id: m.id, name: m.content.Name }))
      }
      writer.set(
        db.doc(`/generalCourts/${currentGeneralCourt}/committees/${id}`),
        update,
        { merge: true }
      )
    })
    await writer.close()
  })

function computeRosters(members: Member[]) {
  const rosters = new Map<string, Member[]>()
  members.forEach(m => {
    m.content.Committees.forEach(c => {
      let roster: Member[]
      if (rosters.has(c.CommitteeCode)) {
        roster = rosters.get(c.CommitteeCode)!
      } else {
        roster = []
        rosters.set(c.CommitteeCode, roster)
      }
      roster.push(m)
    })
  })
  return rosters
}
