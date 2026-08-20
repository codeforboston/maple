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
import { matchesBallotQuestionScope } from "./ballotQuestionScope"

type Refinement = {
  senatorId?: string
  representativeId?: string
  authorRole?: string
  uid?: string
  court?: number
  billId?: string
  ballotQuestionId?: string
}

const initialRefinement = (
  uid?: string,
  court?: number,
  billId?: string,
  ballotQuestionId?: string
): Refinement => ({
  representativeId: undefined,
  senatorId: undefined,
  authorRole: undefined,
  uid,
  court,
  billId,
  ballotQuestionId
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
  billId,
  ballotQuestionId
}: {
  uid?: string
  court?: number
  billId?: string
  ballotQuestionId?: string
} = {}) {
  const { pagination, items, refine, refinement } = useTable(
    initialRefinement(uid, court, billId, ballotQuestionId)
  )

  useEffect(() => {
    if (refinement.uid !== uid) refine({ uid })
    if (refinement.billId !== billId) refine({ billId })
    if (refinement.court !== court) refine({ court })
    if (refinement.ballotQuestionId !== ballotQuestionId)
      refine({ ballotQuestionId })
  }, [ballotQuestionId, billId, court, refine, refinement, uid])

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
  senatorId,
  ballotQuestionId
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
  if (ballotQuestionId)
    constraints.push(["ballotQuestionId", "==", ballotQuestionId])
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
  return result.docs
    .map(d => d.data() as Testimony)
    .filter(testimony => {
      if (refinement.ballotQuestionId)
        return matchesBallotQuestionScope(
          testimony,
          refinement.ballotQuestionId
        )
      if (refinement.billId) return matchesBallotQuestionScope(testimony)
      return true
    })
}
