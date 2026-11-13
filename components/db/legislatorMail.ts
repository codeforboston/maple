import { collection, getDocs, limit, query, where } from "firebase/firestore"
import { useAsync } from "react-async-hook"
import { useAuth } from "../auth"
import { firestore } from "../firebase"

/** Whether a letter for the reader's input is on record, so that one written
 * from it now goes out as an update. A reader can read only their own
 * records, so the query names them. */
export async function hasLetterOnRecord(uid: string, testimonyId: string) {
  const snap = await getDocs(
    query(
      collection(firestore, "legislatorMail"),
      where("uid", "==", uid),
      where("testimonyId", "==", testimonyId),
      limit(1)
    )
  )
  return !snap.empty
}

/** Whether the signed-in reader's input has a letter on record. */
export function useLetterOnRecord(testimonyId?: string) {
  const uid = useAuth().user?.uid
  const { result } = useAsync(
    async () => !!uid && !!testimonyId && hasLetterOnRecord(uid, testimonyId),
    [uid, testimonyId]
  )
  return result ?? false
}
