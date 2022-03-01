import {
  collection,
  getDocs,
  limit,
  orderBy,
  startAfter,
  Timestamp,
  where
} from "firebase/firestore"
import { nth } from "lodash"
import { useMemo, useReducer } from "react"
import { useAsync } from "react-async-hook"
import { firestore } from "../firebase"
import { currentGeneralCourt, loadDoc, nullableQuery } from "./common"

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
  nextHearingAt?: Timestamp
  latestTestimonyAt?: Timestamp
  latestTestimonyId?: string
  fetchedAt: Timestamp
}

type Action =
  | { type: "nextPage" }
  | { type: "previousPage" }
  | { type: "sort"; sort: SortOptions }
  | { type: "billId"; billId: string | null }
  | { type: "onSuccess"; page: Bill[] }
  | { type: "error"; error: Error }

type State = {
  sort: SortOptions
  billId: string | null
  pageKeys: unknown[]
  currentPageKey: unknown | null
  currentPage: number
  billsPerPage: number
  nextKey?: unknown
  previousKey?: unknown
  error: Error | null
}

const initialPage = {
  pageKeys: [null],
  currentPage: 0,
  currentPageKey: null,
  nextKey: undefined,
  previousKey: undefined
}

const initialState: State = {
  ...initialPage,
  billsPerPage: 10,
  billId: null,
  sort: "id",
  error: null
}

function adjacentKeys(keys: unknown[], currentPage: number) {
  return { nextKey: keys[currentPage + 1], previousKey: keys[currentPage - 1] }
}

function reducer(state: State, action: Action): State {
  if (action.type === "nextPage" || action.type === "previousPage") {
    const next = state.currentPage + (action.type === "nextPage" ? 1 : -1),
      nextKey = state.pageKeys[next]
    if (nextKey !== undefined) {
      return {
        ...state,
        currentPage: next,
        currentPageKey: nextKey,
        ...adjacentKeys(state.pageKeys, next)
      }
    } else {
      return state
    }
  } else if (action.type === "sort" && action.sort !== state.sort) {
    return { ...state, sort: action.sort, ...initialPage }
  } else if (action.type === "billId" && action.billId !== state.billId) {
    return { ...state, billId: action.billId, ...initialPage }
  } else if (action.type === "onSuccess") {
    const keys = [...state.pageKeys]
    const bill = nth(action.page, state.billsPerPage - 1)
    keys[state.currentPage + 1] =
      bill !== undefined ? getPageKey(bill, state.sort) : undefined
    return {
      ...state,
      pageKeys: keys,
      ...adjacentKeys(keys, state.currentPage)
    }
  } else if (action.type === "error") {
    console.warn("Error in useBills", action.error)
    return { ...state, error: action.error }
  }
  return state
}

/** Compatibility with existing bill pages.
 *
 * @deprecated Replace with useBills, which provides testimonyCount and
 * hearing/testimony dates
 */
export function useBillContents() {
  const { bills, ...rest } = useBills()
  return { bills: bills?.map(b => b.content), ...rest }
}

export function useBills() {
  const [
    {
      sort,
      billId,
      billsPerPage,
      currentPageKey,
      currentPage,
      nextKey,
      previousKey
    },
    dispatch
  ] = useReducer(reducer, initialState)

  const bills = useAsync(
    () => listBills(sort, billId, billsPerPage, currentPageKey),
    [billId, billsPerPage, currentPageKey, sort],
    {
      onSuccess: page => dispatch({ type: "onSuccess", page }),
      onError: error => dispatch({ type: "error", error })
    }
  )

  return useMemo(
    () => ({
      billsPerPage,
      currentPage: currentPage + 1,
      nextPage: () => dispatch({ type: "nextPage" }),
      previousPage: () => dispatch({ type: "previousPage" }),
      hasNextPage: nextKey !== undefined,
      hasPreviousPage: previousKey !== undefined,
      setSort: (sort: SortOptions) => dispatch({ type: "sort", sort }),
      setBillId: (billId: string | null) =>
        dispatch({ type: "billId", billId }),
      sort,
      billId,
      error: bills.error,
      loading: bills.loading,
      bills: bills.result
    }),
    [
      billsPerPage,
      currentPage,
      nextKey,
      previousKey,
      sort,
      billId,
      bills.error,
      bills.loading,
      bills.result
    ]
  )
}

/** Compatibility with existing bill pages.
 *
 * @deprecated Replace with useBill, which provides testimonyCount and
 * hearing/testimony dates
 */
export function useBillContent(id: string) {
  const { result, loading, error } = useAsync(getBill, [id])

  return {
    bill: result?.content,
    loading,
    error
  }
}

export function useBill(id: string) {
  return useAsync(getBill, [id])
}

type SortOptions =
  | "id"
  | "cosponsorCount"
  | "testimonyCount"
  | "latestTestimony"
  | "hearingDate"

function getOrderBy(sort: SortOptions): Parameters<typeof orderBy> {
  switch (sort) {
    case "cosponsorCount":
      return ["cosponsorCount", "desc"]
    case "hearingDate":
      // TODO: update bill document from hearing scraper
      return ["nextHearingDate"]
    case "id":
      return ["id"]
    case "latestTestimony":
      return ["latestTestimonyAt", "desc"]
    case "testimonyCount":
      return ["testimonyCount", "desc"]
  }
}

function getPageKey(bill: Bill, sort: SortOptions): unknown {
  switch (sort) {
    case "cosponsorCount":
      return bill.cosponsorCount
    case "hearingDate":
      return bill.nextHearingAt
    case "id":
      return bill.id
    case "latestTestimony":
      return bill.latestTestimonyAt
    case "testimonyCount":
      return bill.testimonyCount
  }
}

async function listBills(
  sort: SortOptions,
  billId: string | null,
  limitCount: number,
  startAfterKey: unknown | null
): Promise<Bill[]> {
  const billsRef = collection(
    firestore,
    `/generalCourts/${currentGeneralCourt}/bills`
  )

  const result = await getDocs(
    nullableQuery(
      billsRef,
      billId && where("id", "==", billId),
      orderBy(...getOrderBy(sort)),
      limit(limitCount),
      startAfterKey !== null && startAfter(startAfterKey)
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
