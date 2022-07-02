import { Script } from "./types"

export const script: Script = async ({ db }) => {
  const writer = db.bulkWriter()
  const testimony = await db
    .collectionGroup("publishedTestimony")
    .select()
    .get()
  console.log(`updating ${testimony.size} documents`)
  testimony.forEach(testimony => {
    writer.update(testimony.ref, { id: testimony.id })
  })
  await writer.close()
  console.log(`updated ${testimony.size} documents`)
}
