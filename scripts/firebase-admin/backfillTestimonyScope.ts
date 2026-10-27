/*
  Backfills ballotQuestionId: null and conferenceId: null onto every
  publishedTestimony, archivedTestimony and draftTestimony document missing
  either field.

  Required: bill testimony is read by querying both fields == null, and
  Firestore cannot select on a missing field, so legacy docs would drop out of
  the bill's listing, and re-publishing one would duplicate it rather than
  update it in place. Replaces backfillTestimonyBallotQuestionId, which
  skipped drafts.

  Safe to re-run: fields already set (to any value) are left alone. Pass
  --dry-run to count without writing. Can be removed after running against all
  environments.
*/
import { Boolean, Optional, Record } from "runtypes"
import { Script } from "./types"

const Args = Record({ dryRun: Optional(Boolean) })

const fields = ["ballotQuestionId", "conferenceId"] as const

export const script: Script = async ({ db, args }) => {
  const { dryRun = false } = Args.check(args)
  const writer = db.bulkWriter()
  const would = dryRun ? "would update" : "updated"

  const collNames = [
    "publishedTestimony",
    "archivedTestimony",
    "draftTestimony"
  ]
  const snaps = await Promise.all(
    collNames.map(c =>
      db
        .collectionGroup(c)
        .select(...fields)
        .get()
    )
  )

  collNames.forEach((collName, i) => {
    let updated = 0
    snaps[i].forEach(doc => {
      const data = doc.data()
      const missing = fields.filter(f => !(f in data))
      if (!missing.length) return
      if (!dryRun)
        writer.update(doc.ref, Object.fromEntries(missing.map(f => [f, null])))
      updated++
    })
    console.log(
      `${collName}: ${
        snaps[i].size
      } documents, ${would} ${updated}, already set ${snaps[i].size - updated}`
    )
  })

  await writer.close()
}
