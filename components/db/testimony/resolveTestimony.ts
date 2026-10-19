import {
  collection,
  collectionGroup,
  getDocs,
  query,
  where
} from "firebase/firestore"
import { first } from "lodash"
import { firestore } from "../../firebase"
import { matchesTestimonyScope } from "functions/src/testimony/scope"
import { DraftTestimony, Testimony } from "./types"

/** Resolves the current draft and publication refs for a given user and bill. */
export const resolveBillTestimony = async (
  uid: string,
  court: number,
  billId: string,
  ballotQuestionId?: string,
  conferenceId?: string
) => {
  const published = await getPublishedTestimony(
    uid,
    court,
    billId,
    ballotQuestionId,
    conferenceId
  )
  const draft = await getDraftTestimony(
    uid,
    billId,
    ballotQuestionId,
    conferenceId
  )
  return {
    draft: first(draft)?.ref,
    publication: first(published)?.ref
  }
}

export const getBillTestimony = async (
  uid: string,
  court: number,
  billId: string,
  ballotQuestionId?: string,
  conferenceId?: string
) => {
  const published = await getPublishedTestimony(
    uid,
    court,
    billId,
    ballotQuestionId,
    conferenceId
  )
  const draft = await getDraftTestimony(
    uid,
    billId,
    ballotQuestionId,
    conferenceId
  )
  return {
    draft: first(draft)?.data() as DraftTestimony | undefined,
    publication: first(published)?.data() as Testimony | undefined
  }
}

function getPublishedTestimony(
  uid: string,
  court: number,
  billId: string,
  ballotQuestionId?: string,
  conferenceId?: string
) {
  return getDocs(
    query(
      collectionGroup(firestore, "publishedTestimony"),
      where("authorUid", "==", uid),
      where("billId", "==", billId),
      where("court", "==", court)
    )
  ).then(snapshot =>
    snapshot.docs.filter(doc =>
      matchesTestimonyScope(doc.data(), { ballotQuestionId, conferenceId })
    )
  )
}

function getDraftTestimony(
  uid: string,
  billId: string,
  ballotQuestionId?: string,
  conferenceId?: string
) {
  return getDocs(
    query(
      collection(firestore, `users/${uid}/draftTestimony`),
      where("billId", "==", billId)
    )
  ).then(snapshot =>
    snapshot.docs.filter(doc =>
      matchesTestimonyScope(doc.data(), { ballotQuestionId, conferenceId })
    )
  )
}
