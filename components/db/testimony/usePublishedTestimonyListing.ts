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
import { Testimony } from "common/testimony/types"

type Refinement = {
  senatorId?: string
  representativeId?: string
  authorRole?: string
  uid?: string
  court?: number
  billId?: string
}

const initialRefinement = (
  uid?: string,
  court?: number,
  billId?: string
): Refinement => ({
  representativeId: undefined,
  senatorId: undefined,
  authorRole: undefined,
  uid,
  court,
  billId
})

const useTable = createTableHook<Testimony, Refinement, unknown>({
  getPageKey: i => i.publishedAt,
  getItems: listTestimony,
  name: "published testimony"
})

export type TestimonyFilterOptions =
  | { representativeId: string }
  | { senatorId: string }
  | { authorRole: string }

export type UsePublishedTestimonyListing = ReturnType<
  typeof usePublishedTestimonyListing
>
export function usePublishedTestimonyListing({
  uid,
  court,
  billId
}: {
  uid?: string
  court?: number
  billId?: string
} = {}) {
  const { pagination, items, refine, refinement } = useTable(
    initialRefinement(uid, court, billId)
  )

  useEffect(() => {
    if (refinement.uid !== uid) refine({ uid })
    if (refinement.billId !== billId) refine({ billId })
    if (refinement.court !== court) refine({ court })
  }, [billId, court, refine, refinement, uid])

  return useMemo(() => {
    return {
      pagination,
      setFilter: (r: TestimonyFilterOptions | null) =>
        refine({
          representativeId: undefined,
          senatorId: undefined,
          authorRole: undefined,
          ...r
        }),
      items
    }
  }, [pagination, items, refine])
}

function getWhere({
  uid,
  billId,
  authorRole,
  representativeId,
  court,
  senatorId
}: Refinement): QueryConstraint[] {
  const constraints: Parameters<typeof where>[] = []
  const singularUserRoles: string[] = [
    "user",
    "admin",
    "upgradePending",
    "legislator"
  ]
  if (uid) constraints.push(["authorUid", "==", uid])
  if (billId) constraints.push(["billId", "==", billId])
  if (representativeId)
    constraints.push(["representativeId", "==", representativeId])
  if (senatorId) constraints.push(["senatorId", "==", senatorId])
  if (court) constraints.push(["court", "==", court])
  if (authorRole)
    constraints.push(
      authorRole == "organization"
        ? ["authorRole", "==", authorRole]
        : ["authorRole", "in", singularUserRoles]
    )
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
