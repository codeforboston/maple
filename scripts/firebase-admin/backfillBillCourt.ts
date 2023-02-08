import { Script } from "./types"

const billPathRe = /generalCourts\/(\d+)\/bills\/(\w+)/

export const script: Script = async ({ db }) => {
  const writer = db.bulkWriter()
  const bills = await db.collectionGroup("bills").select().get()
  bills.forEach(bill => {
    const match = bill.ref.path.match(billPathRe) ?? []
    const court = Number(match[1]),
      id = match[2]
    if (isNaN(court) || !id) throw Error("Invalid bill path " + bill.ref.path)

    writer.update(bill.ref, { court })
  })
  await writer.close()
  console.log(`updated ${bills.size} documents`)
}
