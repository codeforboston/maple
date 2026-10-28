import { DocumentData, DocumentReference } from "@google-cloud/firestore"
import { conferenceCountFields } from "../conferences/types"
import { db } from "../firebase"
import { billCountFields, oneTarget, Testimony } from "./types"
import { updateTestimonyCounts } from "./updateTestimonyCounts"

/** What a testimony counts toward: its bill, a ballot question on it, or a
 * committee of conference on it. */
export type TestimonyTarget = {
  kind: "bill" | "ballotQuestion" | "conference"
  ref: DocumentReference
}

type TargetIds = Pick<
  Testimony,
  "court" | "billId" | "ballotQuestionId" | "conferenceId"
>

export function targetOf({
  court,
  billId,
  ballotQuestionId,
  conferenceId
}: TargetIds): TestimonyTarget {
  const one = oneTarget({ ballotQuestionId, conferenceId })
  if (one !== true) throw new Error(one)
  if (ballotQuestionId)
    return {
      kind: "ballotQuestion",
      ref: db.doc(`/ballotQuestions/${ballotQuestionId}`)
    }
  if (conferenceId)
    return {
      kind: "conference",
      ref: db.doc(`/generalCourts/${court}/conferences/${conferenceId}`)
    }
  return {
    kind: "bill",
    ref: db.doc(`/generalCourts/${court}/bills/${billId}`)
  }
}

const countFieldsFor = {
  bill: billCountFields,
  ballotQuestion: billCountFields,
  conference: conferenceCountFields
}

/** The count fields to write on the target, from its current document. */
export const targetCountsUpdate = (
  target: TestimonyTarget,
  data: DocumentData | undefined,
  currentPublication?: Pick<Testimony, "position">,
  newPublication?: Pick<Testimony, "position">
) =>
  updateTestimonyCounts(
    countFieldsFor[target.kind],
    data ?? {},
    currentPublication,
    newPublication
  )
