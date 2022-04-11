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
import { useAsync } from "react-async-hook"
import { firestore } from "../../firebase"
import { currentGeneralCourt, nullableQuery } from "../common"
import { createTableHook } from "../createTableHook"
import { Testimony } from "./types"

/** Lists all published testimony according to the provided constraints.
 */
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

const initialRefinement = (uid?: string, billId?: string): Refinement => ({
  representativeId: undefined,
  senatorId: undefined,
  uid,
  billId
})

const useTable = createTableHook<Testimony, Refinement, unknown>({
  getPageKey: i => i.publishedAt,
  getItems: listTestimony
})

export function usePublishedTestimonyListing2({
  uid,
  billId
}: {
  uid?: string
  billId?: string
}) {
  const { pagination, items, refine, refinement } = useTable(
    initialRefinement(uid, billId)
  )

  useEffect(() => {
    if (refinement.uid !== uid) refine({ uid })
    if (refinement.billId !== billId) refine({ billId })
  }, [billId, refine, refinement, uid])

  return useMemo(
    () => ({
      ...pagination,
      filter: (
        r: { representativeId: string } | { senatorId: string } | null
      ) =>
        refine({
          representativeId: undefined,
          senatorId: undefined,
          ...r
        }),
      error: items.error,
      loading: items.loading,
      items: items.result
    }),
    [pagination, items.error, items.loading, items.result, refine]
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
