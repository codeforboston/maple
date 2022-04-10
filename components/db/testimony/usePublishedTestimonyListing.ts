import {
  collectionGroup,
  getDocs,
  limit,
  orderBy,
  QueryConstraint,
  startAfter,
  where
} from "firebase/firestore"
import { nth } from "lodash"
import { useEffect, useMemo, useReducer } from "react"
import { useAsync } from "react-async-hook"
import { firestore } from "../../firebase"
import { currentGeneralCourt, nullableQuery } from "../common"
import { Testimony } from "./types"

/** Lists all published testimony according to the provided constraints.
 */
// TODO: paginate once we have sufficient testimony
export function usePublishedTestimonyListing({
  uid,
  billId
}: {
  uid?: string
  billId?: string
}) {
  return useAsync(async () => {
    const testimonyRef = collectionGroup(firestore, "publishedTestimony")

    const result = await getDocs(
      nullableQuery(
        testimonyRef,
        where("court", "==", currentGeneralCourt),
        uid && where("authorUid", "==", uid),
        billId && where("billId", "==", billId),
        orderBy("publishedAt", "desc"),
        limit(10)
      )
    )

    return result.docs.map(d => d.data() as Testimony)
  }, [billId, uid])
}

type Refinement = {
  senatorId?: string
  representativeId?: string
  uid?: string
  billId?: string
}

type Action =
  | { type: "nextPage" }
  | { type: "previousPage" }
  | { type: "refine"; refinement: Refinement }
  | { type: "onSuccess"; page: Testimony[] }
  | { type: "error"; error: Error }

type State = {
  refinement: Refinement
  pageKeys: unknown[]
  currentPageKey: unknown
  currentPage: number
  itemsPerPage: number
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

const emptyRefinement: State["refinement"] = {
  billId: undefined,
  representativeId: undefined,
  senatorId: undefined,
  uid: undefined
}

const initialState = (uid?: string, billId?: string): State => ({
  ...initialPage,
  itemsPerPage: 10,
  refinement: { ...emptyRefinement, uid, billId },
  error: null
})

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
  } else if (action.type === "onSuccess") {
    const keys = [...state.pageKeys]
    const item = nth(action.page, state.itemsPerPage - 1)
    keys[state.currentPage + 1] =
      item !== undefined ? item.publishedAt : undefined
    return {
      ...state,
      pageKeys: keys,
      ...adjacentKeys(keys, state.currentPage)
    }
  } else if (action.type === "error") {
    console.warn("Error in testimony", action.error)
    return { ...state, error: action.error }
  } else if (action.type === "refine") {
    return {
      ...state,
      refinement: { ...state.refinement, ...action.refinement },
      ...initialPage
    }
  }
  return state
}

export function usePublishedTestimonyListing2({
  uid,
  billId
}: {
  uid?: string
  billId?: string
}) {
  const [
    {
      refinement,
      itemsPerPage,
      currentPageKey,
      currentPage,
      nextKey,
      previousKey
    },
    dispatch
  ] = useReducer(reducer, initialState(uid, billId))

  const items = useAsync(
    () => {
      return listTestimony(refinement, itemsPerPage, currentPageKey)
    },
    [currentPageKey, refinement, itemsPerPage],
    {
      onSuccess: page => dispatch({ type: "onSuccess", page }),
      onError: error => dispatch({ type: "error", error })
    }
  )

  useEffect(() => {
    if (refinement.uid !== uid)
      dispatch({ type: "refine", refinement: { uid } })
    if (refinement.billId !== billId)
      dispatch({ type: "refine", refinement: { billId } })
  }, [billId, refinement, uid])

  return useMemo(
    () => ({
      itemsPerPage,
      currentPage: currentPage + 1,
      nextPage: () => dispatch({ type: "nextPage" }),
      previousPage: () => dispatch({ type: "previousPage" }),
      hasNextPage: nextKey !== undefined,
      hasPreviousPage: previousKey !== undefined,
      filter: (
        r: { representativeId: string } | { senatorId: string } | null
      ) =>
        dispatch({
          type: "refine",
          refinement: {
            representativeId: undefined,
            senatorId: undefined,
            ...r
          }
        }),
      error: items.error,
      loading: items.loading,
      items: items.result
    }),
    [
      itemsPerPage,
      currentPage,
      nextKey,
      previousKey,
      items.error,
      items.loading,
      items.result
    ]
  )
}

function getWhere({
  uid,
  billId,
  representativeId,
  senatorId
}: Refinement): QueryConstraint[] {
  const constraints: Parameters<typeof where>[] = []
  if (uid) constraints.push(["authoruid", "==", uid])
  if (billId) constraints.push(["billId", "==", billId])
  if (representativeId)
    constraints.push(["representativeId", "==", representativeId])
  if (senatorId) constraints.push(["senatorId", "==", senatorId])
  return constraints.map(c => where(...c))
}

async function listTestimony(
  refinement: Refinement,
  limitCount: number,
  startAfterKey: unknown | null
): Promise<Testimony[]> {
  const testimonyRef = collectionGroup(firestore, "publishedTestimony")
  const result = await getDocs(
    nullableQuery(
      testimonyRef,
      ...getWhere(refinement),
      orderBy("publishedAt", "desc"),
      limit(limitCount),
      startAfterKey !== null && startAfter(startAfterKey)
    )
  )
  return result.docs.map(d => d.data() as Testimony)
}
