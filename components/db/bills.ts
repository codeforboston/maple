import {
  collection,
  getDocs,
  limit,
  orderBy,
  startAfter,
  Timestamp,
  where
} from "firebase/firestore"
import { useMemo } from "react"
import { useAsync } from "react-async-hook"
import type {
  BillHistory,
  CurrentCommittee
} from "../../functions/src/bills/types"
import { firestore } from "../firebase"
import { currentGeneralCourt, loadDoc, midnight, nullableQuery } from "./common"
import { createTableHook } from "./createTableHook"

export type { BillHistory } from "../../functions/src/bills/types"

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
  id: string
  content: BillContent
  cosponsorCount: number
  testimonyCount: number
  endorseCount: number
  opposeCount: number
  neutralCount: number
  nextHearingAt?: Timestamp
  latestTestimonyAt?: Timestamp
  latestTestimonyId?: string
  fetchedAt: Timestamp
  history: BillHistory
  currentCommittee?: CurrentCommittee
  city?: string
}

type Refinement = {
  sort: SortOptions
  filter: FilterOptions | null
}

const useTable = createTableHook<Bill, Refinement, unknown[]>({
  getItems: listBills,
  getPageKey,
  name: "bills"
})

export function useBills() {
  const { items, pagination, refine, refinement } = useTable({
    sort: "id",
    filter: null
  })

  return useMemo(
    () => ({
      pagination,
      setSort: (sort: SortOptions) => refine({ ...refinement, sort }),
      setFilter: (filter: FilterOptions | null) =>
        refine({ ...refinement, filter }),
      sort: refinement.sort,
      items
    }),
    [pagination, items, refine, refinement]
  )
}

export function useBill(id: string) {
  return useAsync(getBill, [id])
}

export type SortOptions =
  | "id"
  | "cosponsorCount"
  | "testimonyCount"
  | "latestTestimony"
  | "hearingDate"

function getOrderBy(sort: SortOptions): Parameters<typeof orderBy>[] {
  switch (sort) {
    case "cosponsorCount":
      return [["cosponsorCount", "desc"], ["id"]]
    case "id":
      return [["id"]]
    case "latestTestimony":
      return [["latestTestimonyAt", "desc"], ["id"]]
    case "testimonyCount":
      return [["testimonyCount", "desc"], ["id"]]
    case "hearingDate":
      return [["nextHearingAt", "desc"], ["id"]]
  }
}

function getPageKey(bill: Bill, { sort }: Refinement): unknown[] {
  switch (sort) {
    case "cosponsorCount":
      return [bill.cosponsorCount, bill.id]
    case "hearingDate":
      return [bill.nextHearingAt, bill.id]
    case "id":
      return [bill.id]
    case "latestTestimony":
      return [bill.latestTestimonyAt, bill.id]
    case "testimonyCount":
      return [bill.testimonyCount, bill.id]
  }
}

export type FilterOptions =
  | { type: "bill"; id: string }
  | { type: "primarySponsor"; id: string }
  | { type: "committee"; id: string }
  | { type: "city"; name: string }

function getFilter(filter: FilterOptions): Parameters<typeof where> {
  switch (filter.type) {
    case "bill":
      return ["id", "==", filter.id]
    case "primarySponsor":
      return ["content.PrimarySponsor.Id", "==", filter.id]
    case "committee":
      return ["currentCommittee.id", "==", filter.id]
    case "city":
      return ["city", "==", filter.name]
  }
}

const billsRef = collection(
  firestore,
  `/generalCourts/${currentGeneralCourt}/bills`
)

async function listBills(
  { sort, filter }: Refinement,
  limitCount: number,
  startAfterKey: unknown[] | null
): Promise<Bill[]> {
  // Exclude the id orderBy clause if filtering on bill ID's
  const excludeOrderById = filter?.type === "bill"
  const orderByConstraints = getOrderBy(sort)
    .filter(o => !excludeOrderById || o[0] !== "id")
    .map(o => orderBy(...o))

  const result = await getDocs(
    nullableQuery(
      billsRef,
      filter && where(...getFilter(filter)),
      ...orderByConstraints,
      limit(limitCount),
      startAfterKey !== null && startAfter(...startAfterKey)
    )
  )
  return result.docs.map(d => d.data() as Bill)
}

export async function getBill(id: string): Promise<Bill | undefined> {
  const bill = await loadDoc(
    `/generalCourts/${currentGeneralCourt}/bills/${id}`
  )
  return bill as any
}

export async function listBillsByHearingDate(
  limitCount: number
): Promise<Bill[]> {
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
