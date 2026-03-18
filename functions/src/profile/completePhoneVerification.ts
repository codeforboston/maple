import * as functions from "firebase-functions"
import { db, auth } from "../firebase"
import { checkAuth, fail } from "../common"

export const completePhoneVerification = functions.https.onCall(
  async (_, context) => {
    const uid = checkAuth(context)

    const user = await auth.getUser(uid)
    const hasPhone = user.providerData?.some(p => p.providerId === "phone")

    if (!hasPhone) {
      throw fail(
        "failed-precondition",
        "Phone number is not linked to this account. Complete phone verification first."
      )
    }

    await db
      .doc(`/profiles/${uid}`)
      .set({ phoneVerified: true }, { merge: true })

    return { phoneVerified: true }
  }
)
