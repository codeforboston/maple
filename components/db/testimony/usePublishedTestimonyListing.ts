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
import { nullableQuery } from "../common"
import { createTableHook } from "../createTableHook"
import { Testimony } from "./types"

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

export function usePublishedTestimonyListing({
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
      pagination,
      filter: (
        r: { representativeId: string } | { senatorId: string } | null
      ) =>
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
      // TODO: add court constraint
      // where("court", "==", currentGeneralCourt),
      ...getWhere(refinement),
      orderBy("publishedAt", "desc"),
      limit(limitCount),
      startAfterKey !== null && startAfter(startAfterKey)
    )
  )
  return result.docs.map(d => d.data() as Testimony)
}
