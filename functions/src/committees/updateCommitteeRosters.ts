import { logger, runWith } from "firebase-functions"
import { DocUpdate } from "../common"
import { db } from "../firebase"
import { Member } from "../members/types"
import { Committee } from "./types"
import { currentGeneralCourt } from "../shared"

export class MissingCommitteeDocsError extends Error {
  constructor(
    public readonly court: number | string,
    public readonly missingIds: string[]
  ) {
    super(
      `updateCommitteeRosters: ${
        missingIds.length
      } committee doc(s) missing for court ${court}: ${missingIds.join(
        ", "
      )}. ` +
        `Run startCommitteeBatches first, or investigate stale member->committee references.`
    )
    this.name = "MissingCommitteeDocsError"
  }
}

export async function runUpdateCommitteeRosters(court: number | string) {
  const members = await db
    .collection(`/generalCourts/${court}/members`)
    .get()
    .then(c => c.docs.map(d => d.data()).filter(Member.guard))
  const rosters = computeRosters(members)

  const committeesRef = db.collection(`/generalCourts/${court}/committees`)
  const existingIds = new Set(
    (await committeesRef.listDocuments()).map(ref => ref.id)
  )
  const missing = Array.from(rosters.keys())
    .filter(id => !existingIds.has(id))
    .sort()
  if (missing.length > 0) {
    const err = new MissingCommitteeDocsError(court, missing)
    logger.error(err.message)
    throw err
  }

  const writer = db.bulkWriter()
  rosters.forEach((roster, id) => {
    const update: DocUpdate<Committee> = {
      members: roster.map(m => ({ id: m.id, name: m.content.Name }))
    }
    writer.set(committeesRef.doc(id), update, {
      merge: true
    })
  })
  await writer.close()
}

/** Updates the list of members in each committee.  */
export const updateCommitteeRosters = runWith({ timeoutSeconds: 120 })
  .pubsub.schedule("every 24 hours")
  .onRun(() => runUpdateCommitteeRosters(currentGeneralCourt))

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
