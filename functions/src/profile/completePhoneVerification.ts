import { onCall } from "firebase-functions/v2/https"
import { db, auth } from "../firebase"
import { checkAuth, fail } from "../common"

export const completePhoneVerification = onCall(async request => {
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
})
