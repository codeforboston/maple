import { doc, getDoc } from "firebase/firestore"
import { firestore } from "../firebase"

export const currentGeneralCourt = 192

export async function loadDoc(path: string) {
  const d = await getDoc(doc(firestore, path))
  return d.data()
}
