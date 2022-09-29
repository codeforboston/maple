import {
  collectionGroup,
  getDocs,
  limit,
  orderBy,
  QueryConstraint,
  where
} from "firebase/firestore"
import { useEffect, useMemo } from "react"
import { firestore } from "../../firebase"
import { currentGeneralCourt, nullableQuery } from "../common"
import { createTableHook } from "../createTableHook"
import { Testimony, TestimonySearchRecord } from "./types"
import { createClient } from "../../../components/search/common"
import { log } from "console"
import { getBillTestimony } from "./resolveTestimony"

type Refinement = {
  senatorId?: string
  representativeId?: string
  uid?: string
  billId?: string
  published?: string
}

const initialRefinement = (
  uid?: string,
  billId?: string,
  published?: string
): Refinement => ({
  representativeId: undefined,
  senatorId: undefined,
  uid,
  billId,
  published
})

const useTable = createTableHook<Testimony, Refinement, unknown>({
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
  billId,
  published,
}: {
  uid?: string
  billId?: string
  published?: string
} = {}) {
  
  const { pagination, items, refine, refinement } = useTable(
    initialRefinement(uid, billId, published)
  )

  useEffect(() => {
    if (refinement.uid !== uid) refine({ uid })
    if (refinement.billId !== billId) refine({ billId })
    if (refinement.published !== published) refine({ published })
  }, [billId, published, refine, refinement, uid])

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

function getWhere({
  uid,
  billId,
  representativeId,
  senatorId
}: Refinement): QueryConstraint[] {
  const constraints: Parameters<typeof where>[] = []
  if (uid) constraints.push(["authorUid", "==", uid])
  if (billId) constraints.push(["billId", "==", billId])
  if (representativeId)
    constraints.push(["representativeId", "==", representativeId])
  if (senatorId) constraints.push(["senatorId", "==", senatorId])
  return constraints.map(c => where(...c))
}

async function listTestimony(
  refinement: Refinement
): Promise<Testimony[]> {
  const client = createClient()
  const publishedBool = refinement.published === "true"

  let query = { }

  if (!publishedBool && refinement.billId && refinement.uid) {
      const result = await getBillTestimony(refinement.uid, refinement.billId)

      return [result.draft] as Testimony[]
  }

  if (refinement.billId && refinement.uid) {
    query = {
      q: refinement.uid,
      query_by: "authorUid",
      filter_by: `billId:=${refinement.billId}`
    }
    console.log(1, query)
  } else if (refinement.billId) {
    console.log(2)
    query = {
      q: refinement.billId,
      query_by: "billId"
    }
  } else if (refinement.uid) {
    console.log(3)
    query = {
      q: refinement.uid,
      query_by: "authorUid"
    }
  } else {
    query = {
      q: "*",
      query_by: "billId"
    }
  }


  const data = await client
    .collections("publishedTestimony")
    .documents()
    .search(query)

  console.log('Data', data.hits?.length)
  return data.hits
    ? data.hits.map(({ document }) => ({
        ...document,
        publishedAt: document.publishedAt
      }) as TestimonySearchRecord
    ) : []


  // const result = await getDocs(
  //   nullableQuery(
  //     testimonyRef,
  //     ...getWhere(refinement),
  //     where("court", "==", currentGeneralCourt),
  //     orderBy("publishedAt", "desc"),
  //     limit(limitCount),
  //     startAfterKey !== null && startAfter(startAfterKey)
  //   )
  // )

}
