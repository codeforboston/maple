import { FieldValue } from "functions/src/firebase"
import { Script } from "./types"

// One-time migration: earlier code wrote `vector_embedding` as a plain number[]
// instead of a Firestore VectorValue. Plain arrays are not picked up by the
// vector index, so findNearest() returns nothing. This script re-wraps every
// existing plain-array embedding as FieldValue.vector(...) in place. It makes
// NO Vertex AI calls — it just reuses the values already stored.
//
// Idempotent: docs whose field is already a VectorValue (toArray() present) or
// missing entirely are left untouched.
export const script: Script = async ({ db }) => {
  const collections = [
    { name: "bills", group: true },
    { name: "publishedTestimony", group: true },
    { name: "ballotQuestions", group: false }
  ]

  const bulkWriter = db.bulkWriter()
  let migrated = 0
  let alreadyVector = 0
  let skippedEmpty = 0

  for (const col of collections) {
    console.log(`Scanning ${col.name}...`)
    const ref: any = col.group
      ? db.collectionGroup(col.name)
      : db.collection(col.name)
    const snapshot = await ref.get()
    console.log(`  ${snapshot.size} documents`)

    for (const doc of snapshot.docs) {
      const value = doc.data().vector_embedding
      if (!value) {
        skippedEmpty++
        continue
      }
      // Already a VectorValue — nothing to do.
      if (typeof (value as any).toArray === "function") {
        alreadyVector++
        continue
      }
      // Plain array (the broken format) → re-wrap as a VectorValue.
      if (Array.isArray(value)) {
        bulkWriter.update(doc.ref, {
          vector_embedding: FieldValue.vector(value)
        })
        migrated++
      }
    }
  }

  await bulkWriter.close()

  console.log(
    `Done. migrated=${migrated}, alreadyVector=${alreadyVector}, noEmbedding=${skippedEmpty}`
  )
}
