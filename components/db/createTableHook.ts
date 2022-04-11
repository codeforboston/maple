import { nth } from "lodash"
import { useMemo, useReducer } from "react"
import { useAsync } from "react-async-hook"

type State<R, P> = {
  refinement: R
  pageKeys: (P | null)[]
  currentPageKey: P | null
  currentPage: number
  itemsPerPage: number
  nextKey?: P | null
  previousKey?: P | null
  error: Error | null
}

type Action<I, R> =
  | { type: "nextPage" }
  | { type: "previousPage" }
  | { type: "refine"; refinement: R }
  | { type: "onSuccess"; page: I[] }
  | { type: "error"; error: Error }

type Config<I, R, P> = {
  getPageKey: (item: I, refinement: R) => P
  getItems: (
    refinement: R,
    itemsPerPage: number,
    pageKey: P | null
  ) => Promise<I[]>
}

function adjacentKeys<P>(keys: (P | null | undefined)[], currentPage: number) {
  return { nextKey: keys[currentPage + 1], previousKey: keys[currentPage - 1] }
}

const initialPage = {
  pageKeys: [null],
  currentPage: 0,
  currentPageKey: null,
  nextKey: undefined,
  previousKey: undefined
}

export type Pagination = {
  itemsPerPage: number
  currentPage: number
  nextPage: () => void
  previousPage: () => void
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export function createTableHook<Item, Refinement, PageKey>({
  getPageKey,
  getItems
}: Config<Item, Refinement, PageKey>) {
  function reducer(
    state: State<Refinement, PageKey>,
    action: Action<Item, Refinement>
  ): State<Refinement, PageKey> {
    if (action.type === "nextPage" || action.type === "previousPage") {
      const next = state.currentPage + (action.type === "nextPage" ? 1 : -1)
      if (next >= 0 && next < state.pageKeys.length) {
        return {
          ...state,
          currentPage: next,
          currentPageKey: state.pageKeys[next],
          ...adjacentKeys(state.pageKeys, next)
        }
      } else {
        return state
      }
    } else if (action.type === "onSuccess") {
      const keys = [...state.pageKeys]
      const item = nth(action.page, state.itemsPerPage - 1)
      if (item !== undefined)
        keys[state.currentPage + 1] = getPageKey(item, state.refinement)
      return {
        ...state,
        pageKeys: keys,
        ...adjacentKeys(keys, state.currentPage)
      }
    } else if (action.type === "error") {
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

  return (initialRefinement: Refinement) => {
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
    ] = useReducer(reducer, {
      ...initialPage,
      itemsPerPage: 10,
      refinement: initialRefinement,
      error: null
    })

    const items = useAsync(
      () => {
        return getItems(refinement, itemsPerPage, currentPageKey)
      },
      [currentPageKey, refinement, itemsPerPage],
      {
        onSuccess: page => dispatch({ type: "onSuccess", page }),
        onError: error => dispatch({ type: "error", error })
      }
    )

    const pagination = useMemo(
      () => ({
        itemsPerPage,
        currentPage: currentPage + 1,
        nextPage: () => dispatch({ type: "nextPage" }),
        previousPage: () => dispatch({ type: "previousPage" }),
        hasNextPage: nextKey !== undefined,
        hasPreviousPage: previousKey !== undefined
      }),
      [currentPage, itemsPerPage, nextKey, previousKey]
    )

    return useMemo(
      () => ({
        pagination,
        items,
        refinement,
        refine: (refinement: Refinement) =>
          dispatch({ type: "refine", refinement })
      }),
      [pagination, items, refinement]
    )
  }
}
