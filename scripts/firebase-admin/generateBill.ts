// import { Timestamp } from "firebase/firestore"
import { Timestamp } from "../../functions/src/firebase"
import { Record, String, Number } from "runtypes"
import { Script } from "./types"
import { Bill, BillContent } from "../../functions/src/bills/types"

const Args = Record({
  court: Number,
  bills: String
})

export const script: Script = async ({ db, args }) => {
  const a = Args.check(args)
  const bills = a.bills.split(" ")
  const court = a.court
  let batch = db.batch()
  let opsCounter = 0

  for (const id of bills) {
    const newBillContent: BillContent = {
      Pinslip: "",
      Title: "",
      PrimarySponsor: null,
      DocumentText: "",
      Cosponsors: []
    }

    const newBill: Bill = {
      id: id,
      court: court,
      content: newBillContent,
      cosponsorCount: 0,
      testimonyCount: 0,
      endorseCount: 0,
      opposeCount: 0,
      neutralCount: 0,
      fetchedAt: Timestamp.now(),
      history: [],
      similar: []
    }
    console.log(`/generalCourts/${court}/bills/${id}`)
    const billRef = db.collection(`/generalCourts/${court}/bills`).doc(`${id}`)
    batch.set(billRef, newBill)
    opsCounter++
  }

  await batch.commit()
  console.log(`Batch of ${opsCounter} bills added.`)
}
