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
  authorRole?: string
  uid?: string
  court?: number
  billId?: string
  ballotQuestionId?: string
  conferenceId?: string
}

const initialRefinement = (
  uid?: string,
  court?: number,
  billId?: string,
  ballotQuestionId?: string,
  conferenceId?: string
): Refinement => ({
  representativeId: undefined,
  senatorId: undefined,
  authorRole: undefined,
  uid,
  court,
  billId,
  ballotQuestionId,
  conferenceId
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
  ballotQuestionId,
  conferenceId
}: {
  uid?: string
  court?: number
  billId?: string
  ballotQuestionId?: string
  conferenceId?: string
} = {}) {
  const { pagination, items, refine, refinement } = useTable(
    initialRefinement(uid, court, billId, ballotQuestionId, conferenceId)
  )

  useEffect(() => {
    if (refinement.uid !== uid) refine({ uid })
    if (refinement.billId !== billId) refine({ billId })
    if (refinement.court !== court) refine({ court })
    if (refinement.ballotQuestionId !== ballotQuestionId)
      refine({ ballotQuestionId })
    if (refinement.conferenceId !== conferenceId) refine({ conferenceId })
  }, [ballotQuestionId, billId, conferenceId, court, refine, refinement, uid])

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
  ballotQuestionId,
  conferenceId
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
  // A bill's listing is one scope: the bill alone, a ballot question or a
  // conference.
  if (billId || ballotQuestionId)
    constraints.push(["ballotQuestionId", "==", ballotQuestionId ?? null])
  if (billId || conferenceId)
    constraints.push(["conferenceId", "==", conferenceId ?? null])
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
  const testimony = result.docs.map(d => d.data() as Testimony)
  return refinement.billId ||
    refinement.ballotQuestionId ||
    refinement.conferenceId
    ? testimony
    : // Unscoped listings would need an index per filter for this.
      testimony.filter(t => !t.conferenceId)
}
