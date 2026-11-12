import { db } from "../firebase"
import { LetterRecord } from "./types"

/** The last letter on record for a reader's input, if one went out. Only
 * letters carry a `testimonyId`. */
export async function lastLetterFor(testimonyId: string) {
  const snap = await db
    .collection("/legislatorMail")
    .where("testimonyId", "==", testimonyId)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get()
  return snap.docs[0]?.data() as LetterRecord | undefined
}
