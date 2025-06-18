import { Timestamp } from "../../common/types"
import { Record, String, Number } from "runtypes"
import { Script } from "./types"
import { FieldValue } from "functions/src/firebase"

const Args = Record({ court: Number, bills: String })
export const script: Script = async ({ db, args }) => {
  const a = Args.check(args)
  const bills = a.bills.split(" ")
  const court = a.court
  for (const id of bills) {
    await db.doc(`/generalCourts/${court}/bills/${id}`).update({
      history: FieldValue.arrayUnion({
        Action: "Placed on file",
        Branch: "Senate",
        Date: Timestamp.now().toDate().toISOString()
      })
    })
    console.log("Updated history", id)
  }
}
