import { Timestamp } from "../../functions/src/firebase"
import { Record, String, Number } from "runtypes"
import { Script } from "./types"

const Args = Record({ court: Number, bills: String })
export const script: Script = async ({ db, args }) => {
  const a = Args.check(args)
  const bills = a.bills.split(" ")
  const court = a.court
  for (const id of bills) {
    await db
      .doc(`/generalCourts/${court}/bills/${id}`)
      .update({ updatedAt: Timestamp.now() })
    console.log("Updated", id)
  }
}
