import { https, logger } from "firebase-functions"
import { auth, db } from "./firebase"
import {
  Record as R,
  String as RtString,
  Number,
  Literal as L,
  Union,
  Static
} from "runtypes"

const maxTestimonyLength = 10_000

const SubmitTestimonyRequest = R({
  testimony: RtString.withConstraint(
    s => s.length > 0 && s.length < maxTestimonyLength
  ),
  position: Union(L("endorse"), L("oppose"), L("neutral")),
  court: Number.withConstraint(n => n > 0 && n < 200),
  billId: RtString.withConstraint(s => s.length > 0 && s.length < 10)
})

type SubmitTestimonyRequest = Static<typeof SubmitTestimonyRequest>

function parseRequestOrFail(data: any) {
  const validationResult = SubmitTestimonyRequest.validate(data)
  if (!validationResult.success) {
    throw new https.HttpsError(
      "invalid-argument",
      `${validationResult.code}: ${validationResult.message}`
    )
  }
  return validationResult.value
}

export const submitTestimony = https.onCall(async (data, context) => {
  const uid = context.auth?.uid
  if (!uid) {
    throw new https.HttpsError(
      "permission-denied",
      "Caller must be signed in to submit testimony"
    )
  }
  const request = parseRequestOrFail(data),
    user = await auth.getUser(uid),
    billRef = db.doc(`/generalCourts/${request.court}/bills/${request.billId}`),
    // Each user can submit a single testimony for each bill.
    testimonyRef = db.doc(
      `/testimony/${request.court}-${request.billId}-${user.uid}`
    )

  try {
    await db.runTransaction(async t => {
      const bill = await t.get(billRef)
      if (!bill.exists) {
        throw new Error(
          `Bill ${request.billId} in court ${request.court} does not exist.`
        )
      }
      const newTestimonyCount = (bill.data()?.testimonyCount ?? 0) + 1
      t.update(billRef, { testimonyCount: newTestimonyCount })
      t.create(testimonyRef, {
        submitterId: user.uid,
        submitterName: user.displayName
          ? decodeHtmlCharCodes(user.displayName)
          : "Anonymous",
        submittedAt: new Date(),
        billId: request.billId,
        court: request.court,
        position: request.position,
        content: request.testimony
      })
    })
  } catch (e) {
    const message = (e as any).message
    logger.warn("Submission transaction failed.", message)
    throw new https.HttpsError(
      "aborted",
      "Could not complete submission. " + message
    )
  }

  return {
    status: "ok",
    testimonyDocPath: testimonyRef.path
  }
})

const decodeHtmlCharCodes = (s: string) =>
  s.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
    String.fromCharCode(charCode)
  )
