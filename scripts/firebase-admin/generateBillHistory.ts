import { Timestamp } from "../../common/types"
import { Record, String, Number } from "runtypes"
import { Script } from "./types"
import { BillHistoryAction } from "../../functions/src/bills/types"
import { FieldValue } from "functions/src/firebase"

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
    const billHistoryAction: BillHistoryAction = {
      Date: Timestamp.now().valueOf(),
      Branch: Math.random() < 0.5 ? "Senate" : "House",
      Action: (Math.random() + 1).toString(36).substring(2)
    }

    const billRef = db.collection(`/generalCourts/${court}/bills`).doc(`${id}`)
    batch.update(billRef, { history: FieldValue.arrayUnion(billHistoryAction) })
    opsCounter++

    if (opsCounter % 500 === 0) {
      await batch.commit()
      batch = db.batch()
    }
  }

  if (opsCounter % 500 !== 0) {
    await batch.commit()
  }

  console.log(`Batch of ${opsCounter} bills updated.`)
}
