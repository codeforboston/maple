import * as functions from "firebase-functions"
import { onCall } from "firebase-functions/v2/https"
import type { CallableRequest } from "firebase-functions/v2/https"
import { db, auth } from "../firebase"
import { checkAuth, fail } from "../common"

const handleCompletePhoneVerification = async (request: CallableRequest) => {
  const uid = checkAuth(request)

  const user = await auth.getUser(uid)
  const hasPhone = user.providerData?.some(p => p.providerId === "phone")

  if (!hasPhone) {
    throw fail(
      "failed-precondition",
      "Phone number is not linked to this account. Complete phone verification first."
    )
  }

  await db.doc(`/profiles/${uid}`).set({ phoneVerified: true }, { merge: true })

  return { phoneVerified: true }
}

export const completePhoneVerification = functions.https.onCall(
  (data, context) =>
    handleCompletePhoneVerification({
      data,
      auth: context.auth
    } as CallableRequest)
)
export const completePhoneVerificationV2 = onCall(
  handleCompletePhoneVerification
)
