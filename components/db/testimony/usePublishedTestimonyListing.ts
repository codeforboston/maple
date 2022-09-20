import {
  collectionGroup,
  getDocs,
  limit,
  orderBy,
  QueryConstraint,
  startAfter,
  where
} from "firebase/firestore"
import { useEffect, useMemo } from "react"
import { firestore } from "../../firebase"
import { currentGeneralCourt, nullableQuery } from "../common"
import { createTableHook } from "../createTableHook"
import { Testimony } from "./types"
import { createClient } from "../../../functions/src/search/client"

type Refinement = {
  senatorId?: string
  representativeId?: string
  uid?: string
  billId?: string,
  profilePage?: boolean
}

const initialRefinement = (uid?: string, billId?: string, profilePage?: boolean): Refinement => ({
  representativeId: undefined,
  senatorId: undefined,
  uid,
  billId,
  profilePage
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
  profilePage
}: {
  uid?: string
  billId?: string
  profilePage?: boolean
} = {}) {
  const { pagination, items, refine, refinement } = useTable(
    initialRefinement(uid, billId, profilePage)
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
  refinement: Refinement,
  limitCount: number,
  startAfterKey: unknown | null
): Promise<Testimony[]> {
  if (refinement.profilePage && refinement.uid) {
    const client = createClient()

    const data = await client
      .collections('publishedTestimony')
      .documents()
      .search({q: refinement.uid, query_by: 'authorUid'})

    return data.hits ? data.hits.map(({ document }) => document as Testimony) : []
  }

  const testimonyRef = collectionGroup(firestore, "publishedTestimony")

  const result = await getDocs(
    nullableQuery(
      testimonyRef,
      ...getWhere(refinement),
      where("court", "==", currentGeneralCourt),
      orderBy("publishedAt", "desc"),
      limit(limitCount),
      startAfterKey !== null && startAfter(startAfterKey)
    )
  )

  return result.docs.map(d => d.data() as Testimony)  
}
