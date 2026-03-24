/*
  Backfills ballotQuestionId: null onto all existing publishedTestimony and
  archivedTestimony documents that do not have the field set.

  Required: Firestore composite indexes exclude documents where indexed fields
  are absent. resolvePublication() queries by billId + court + ballotQuestionId,
  so legacy docs without the field would be duplicated on re-publish rather than
  updated in place.

  Safe to re-run: documents already having the field (any value) are skipped.
  Can be removed after running against all environments.
*/
import { Script } from "./types"

export const script: Script = async ({ db }) => {
  const writer = db.bulkWriter()
  let updated = 0,
    skipped = 0

  const [publishedSnap, archivedSnap] = await Promise.all([
    db.collectionGroup("publishedTestimony").select("ballotQuestionId").get(),
    db.collectionGroup("archivedTestimony").select("ballotQuestionId").get()
  ])

  for (const [collName, snap] of [
    ["publishedTestimony", publishedSnap],
    ["archivedTestimony", archivedSnap]
  ] as const) {
    console.log(`${collName}: ${snap.size} documents`)
    snap.forEach(doc => {
      if (!("ballotQuestionId" in doc.data())) {
        writer.update(doc.ref, { ballotQuestionId: null })
        updated++
      } else {
        skipped++
      }
    })
  }

  await writer.close()
  console.log(`Done. Updated: ${updated}, Skipped (already set): ${skipped}`)
}
