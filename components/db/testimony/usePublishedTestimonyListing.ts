import { useEffect, useMemo } from "react"
import { createTableHook } from "../createTableHook"
import { TestimonySearchRecord } from "./types"
import { createClient } from "../../../components/search/common"

type Refinement = {
  senatorId?: string
  representativeId?: string
  uid?: string
  billId?: string
  published?: string
}

const initialRefinement = (
  uid?: string,
  billId?: string
): Refinement => ({
  representativeId: undefined,
  senatorId: undefined,
  uid,
  billId
})

const useTable = createTableHook<TestimonySearchRecord, Refinement, unknown>({
  getPageKey: i => i.publishedAt,
  getItems: listTestimony,
  name: "published testimony"
})

export type TestimonyFilterOptions =
  | { representativeId: string }
  | { senatorId: string }

export type UsePublishedTestimonyListing = ReturnType<
  typeof usePublishedTestimonyListing
>

export function usePublishedTestimonyListing({
  uid,
  billId
}: {
  uid?: string
  billId?: string
} = {}) {
  
  const { pagination, items, refine, refinement } = useTable(
    initialRefinement(uid, billId)
  )

  useEffect(() => {
    if (refinement.uid !== uid) refine({ uid })
    if (refinement.billId !== billId) refine({ billId })
  }, [billId, refine, refinement, uid])

  return useMemo(
    () => ({
      pagination,
      setFilter: (r: TestimonyFilterOptions | null) =>
        refine({
          representativeId: undefined,
          senatorId: undefined,
          ...r
        }),
      items
    }),
    [pagination, items, refine]
  )
}

export interface TypeSenseQuery {
  q: string;
  query_by: string;
  filter_by?: string  
}

async function listTestimony(
  refinement: Refinement
): Promise<TestimonySearchRecord[]> {
  const client = createClient()
  
  let query: TypeSenseQuery = {
    q: "*",
    query_by: "billId"
  }

  if (refinement.billId && refinement.uid) {
    query = {
      q: refinement.uid,
      query_by: "authorUid",
      filter_by: `billId:=${refinement.billId}`
    }
  } else if (refinement.billId) {
    query = {
      q: refinement.billId,
      query_by: "billId"
    }
  } else if (refinement.uid) {
    query = {
      q: refinement.uid,
      query_by: "authorUid"
    }
  }

  const data = await client
    .collections("publishedTestimony")
    .documents()
    .search(query)

  const hits = data.hits?.map(({ document }) => ({
    ...document,
    publishedAt: (document as any).publishedAt
  })) || []

  return hits as TestimonySearchRecord[] 
}
