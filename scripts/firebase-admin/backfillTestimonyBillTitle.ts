import { Script } from "./types"

export const script: Script = async ({ db }) => {
  const writer = db.bulkWriter()
  const testimony = await db
    .collectionGroup("publishedTestimony")
    .select("court", "billId", "billTitle")
    .get()

  console.log(`updating ${testimony.size} documents`)

  let updateCount = 0
  for (const doc of testimony.docs) {
    const { court, billId, billTitle: existingTitle } = doc.data()
    if (!existingTitle) {
      const bill = await db.doc(`/generalCourts/${court}/bills/${billId}`).get()
      const billTitle = bill.data()!.content.Title
      writer.update(doc.ref, { billTitle })
      updateCount++
    }
  }
  await writer.close()

  console.log(`updated ${updateCount} documents`)
}
