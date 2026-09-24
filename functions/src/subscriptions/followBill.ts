import { onCall, HttpsError } from "firebase-functions/v2/https"
import { subscribeToBillTopic } from "./subscribeToBillTopic"
import { getAuth, UserRecord } from "firebase-admin/auth"
import { getFirestore, Firestore } from "firebase-admin/firestore"

export const followBill = onCall(async request => {
  if (!request.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    )
  }

  const user: UserRecord = await getAuth().getUser(request.auth.uid) // Get user based on UID
  const billLookup = request.data.billLookup
  const db: Firestore = getFirestore()

  try {
    await subscribeToBillTopic({ user, billLookup, db })
    return { status: "success", message: "Bill subscription added" }
  } catch (error: any) {
    throw new HttpsError("internal", "Failed to subscribe to bill", {
      details: error.message
    })
  }
})
