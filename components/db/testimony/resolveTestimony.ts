import {
  collection,
  collectionGroup,
  getDocs,
  query,
  where
} from "firebase/firestore"
import { first } from "lodash"
import { firestore } from "../../firebase"
import { DraftTestimony, Testimony } from "./types"

/** Resolves the current draft and publication refs for a given user and bill. */
export const resolveBillTestimony = async (uid: string, billId: string) => {
  const published = await getPublishedTestimony(uid, billId)
  const draft = await getDraftTestimony(uid, billId)
  return {
    draft: first(draft.docs)?.ref,
    publication: first(published.docs)?.ref
  }
}

export const getBillTestimony = async (uid: string, billId: string) => {
  const published = await getPublishedTestimony(uid, billId)
  const draft = await getDraftTestimony(uid, billId)
  return {
    draft: first(draft.docs)?.data() as DraftTestimony | undefined,
    publication: first(published.docs)?.data() as Testimony | undefined
  }
}

function getPublishedTestimony(uid: string, billId: string) {
  return getDocs(
    query(
      collectionGroup(firestore, "publishedTestimony"),
      where("authorUid", "==", uid),
      where("billId", "==", billId)
    )
  )
}

function getDraftTestimony(uid: string, billId: string) {
  return getDocs(
    query(
      collection(firestore, `users/${uid}/draftTestimony`),
      where("billId", "==", billId)
    )
  )
}
