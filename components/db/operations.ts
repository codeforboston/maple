import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter
} from "firebase/firestore"
import { firestore } from "../firebase"
import { BillContent, MemberContent } from "./types"

const currentGeneralCourt = 192

export async function listBills(
  billLimit = 20,
  startAfterBillNumber?: string
): Promise<BillContent[]> {
  let q = query(
    collection(firestore, `/generalCourts/${currentGeneralCourt}/bills`),
    orderBy("id"),
    limit(billLimit)
  )
  if (startAfterBillNumber) {
    q = query(q, startAfter(startAfterBillNumber))
  }
  const result = await getDocs(q)
  return result.docs.map(d => d.data().content) as any
}

export async function getMember(memberCode: string): Promise<MemberContent> {
  const member = await getDoc(
    doc(
      firestore,
      `/generalCourts/${currentGeneralCourt}/members/${memberCode}`
    )
  )
  return member.data()?.content
}
