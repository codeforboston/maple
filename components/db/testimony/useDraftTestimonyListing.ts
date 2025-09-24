import {
  getDocs,
  collection,
  limit,
  startAfter,
  orderBy
} from "firebase/firestore"
import { firestore } from "../../firebase"
import { nullableQuery } from "../common"
import { DraftTestimony } from "./types"
import { createTableHook } from "../createTableHook"

type Refinement = {
  uid: string
}

const initialRefinement = (uid: string): Refinement => ({
  uid
})

const useTable = createTableHook<DraftTestimony, Refinement, unknown>({
  getPageKey: i => i.billId,
  getItems: listTestimony,
  name: "draft testimony"
})

export type UseDraftTestimonyListing = ReturnType<
  typeof useDraftTestimonyListing
>
export function useDraftTestimonyListing({ uid }: { uid: string }) {
  const { pagination, items, refine, refinement } = useTable(
    initialRefinement(uid)
  )

  return {
    pagination,
    items,
    refine
  }
}

async function listTestimony(
  refinement: Refinement,
  limitCount: number,
  startAfterKey: unknown | null
): Promise<DraftTestimony[]> {
  const result = await getDocs(
    nullableQuery(
      collection(firestore, `/users/${refinement.uid}/draftTestimony`),
      orderBy("billId"), // Draft doesn't have publishedAt, use billId instead
      limit(limitCount),
      startAfterKey !== null && startAfter(startAfterKey)
    )
  )
  return result.docs.map(d => d.data() as DraftTestimony)
}
