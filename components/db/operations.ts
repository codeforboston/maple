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
import { BillContent, MemberContent, MemberSearchIndex } from "./types"

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

export async function getMember(
  memberCode: string
): Promise<MemberContent | undefined> {
  const member = await loadDoc(
    `/generalCourts/${currentGeneralCourt}/members/${memberCode}`
  )
  return member?.content
}

export async function getBill(id: string): Promise<BillContent | undefined> {
  const bill = await loadDoc(
    `/generalCourts/${currentGeneralCourt}/bills/${id}`
  )
  return bill?.content
}

export async function getMemberSearchIndex(): Promise<
  MemberSearchIndex | undefined
> {
  return loadDoc(
    `/generalCourts/${currentGeneralCourt}/indexes/memberSearch`
  ) as any
}

async function loadDoc(path: string) {
  const d = await getDoc(doc(firestore, path))
  return d.data()
}
