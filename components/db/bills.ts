import {
  query,
  collection,
  orderBy,
  limit,
  startAfter,
  getDocs
} from "firebase/firestore"
import { useState, useEffect, useMemo } from "react"
import { firestore } from "../firebase"
import { currentGeneralCourt, loadDoc } from "./common"

export type MemberReference = {
  Id: string
  Name: string
  Type: number
}

export type BillContent = {
  Title: string
  BillNumber: string
  DocketNumber: string
  GeneralCourtNumber: number
  PrimarySponsor: MemberReference
  Cosponsors: MemberReference[]
  LegislationTypeName: string
  Pinslip: string
  DocumentText: string
}

export type Bill = {
  content: BillContent
  fetchedAt: Date
  id: string
}

export function useBills() {
  const [bills, setBills] = useState<BillContent[] | undefined>(undefined)

  useEffect(() => {
    const fetchBills = async () => {
      if (bills === undefined) {
        const fetched = await listBills(10)
        setBills(fetched)
      }
    }
    fetchBills()
  }, [bills])

  return useMemo(
    () => ({
      bills,
      loading: bills === undefined
    }),
    [bills]
  )
}

export function useBill(id: string) {
  const [bill, setBill] = useState<BillContent | undefined>(undefined)

  useEffect(() => {
    const fetchBill = async () => {
      if (bill?.BillNumber !== id) {
        const fetched = await getBill(id)
        setBill(fetched)
      }
    }
    fetchBill()
  }, [bill, id])

  return useMemo(
    () => ({
      bill,
      loading: bill === undefined
    }),
    [bill]
  )
}

async function listBills(
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

export async function getBill(id: string): Promise<BillContent | undefined> {
  const bill = await loadDoc(
    `/generalCourts/${currentGeneralCourt}/bills/${id}`
  )
  return bill?.content
}
