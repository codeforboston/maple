import {
  collection,
  getDocs,
  limit,
  orderBy,
  Timestamp,
  where
} from "firebase/firestore"
import { useAsync } from "react-async-hook"
import type {
  BillHistory,
  CurrentCommittee
} from "../../functions/src/bills/types"
import { firestore } from "../firebase"
import { loadDoc, midnight, nullableQuery } from "./common"
import { currentGeneralCourt } from "functions/src/shared"
export type { BillHistory } from "../../functions/src/bills/types"

export type MemberReference = {
  Id: string
  Name: string
  /**  1 = Legislative Member, 2 = Committee, 3 = Public Request, 4 = Special
   * Request */
  Type: number
}

export type BillContent = {
  Title: string
  BillNumber: string
  DocketNumber: string
  GeneralCourtNumber: number
  PrimarySponsor?: MemberReference
  Cosponsors: MemberReference[]
  LegislationTypeName: string
  Pinslip: string
  DocumentText: string
}

export type BillTopic = {
  category: string
  topic: string
}

export type Bill = {
  id: string
  court: number
  content: BillContent
  cosponsorCount: number
  testimonyCount: number
  endorseCount: number
  opposeCount: number
  neutralCount: number
  nextHearingAt?: Timestamp
  hearingIds?: string[]
  latestTestimonyAt?: Timestamp
  latestTestimonyId?: string
  fetchedAt: Timestamp
  history: BillHistory
  currentCommittee?: CurrentCommittee
  city?: string
  topics?: BillTopic[]
  summary?: string
}

export function useBill(court: number, id: string) {
  return useAsync(getBill, [court, id])
}

export type SortOptions =
  | "id"
  | "cosponsorCount"
  | "testimonyCount"
  | "latestTestimony"
  | "hearingDate"

export type FilterOptions =
  | { type: "bill"; id: string }
  | { type: "primarySponsor"; id: string }
  | { type: "committee"; id: string }
  | { type: "city"; name: string }

export async function getBill(
  court: number,
  id: string
): Promise<Bill | undefined> {
  const bill = await loadDoc(`/generalCourts/${court}/bills/${id}`)
  return bill as any
}

export async function listBillsByHearingDate(
  limitCount: number
): Promise<Bill[]> {
  const billsRef = collection(
    firestore,
    `/generalCourts/${currentGeneralCourt}/bills`
  )
  const result = await getDocs(
    nullableQuery(
      billsRef,
      where("nextHearingAt", ">=", midnight()),
      orderBy("nextHearingAt", "asc"),
      limit(limitCount)
    )
  )
  return result.docs.map(d => d.data() as Bill)
}
