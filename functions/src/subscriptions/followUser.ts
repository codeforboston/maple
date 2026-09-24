import { onCall, HttpsError } from "firebase-functions/v2/https"
import { subscribeToTestimonyTopic } from "./subscribeToTestimonyTopic"
import { getAuth, UserRecord } from "firebase-admin/auth"
import { getFirestore, Firestore } from "firebase-admin/firestore"

export const followUser = onCall(async request => {
  // Debug: Log the received data
  console.log("Debug: Data received in followOrg:", request.data)

  // Check for authentication
  if (!request.auth) {
    throw new HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    )
  }

  // Runtime check for 'userLookup' property
  if (!request.data.hasOwnProperty("userLookup")) {
    throw new HttpsError("failed-precondition", "userLookup must be provided.")
  }

  const user: UserRecord = await getAuth().getUser(request.auth.uid)
  const userLookup = request.data.userLookup
  const db: Firestore = getFirestore()

  try {
    await subscribeToTestimonyTopic({ user, userLookup, db })
    return { status: "success", message: "User subscription added" }
  } catch (error: any) {
    throw new HttpsError("internal", "Failed to subscribe to user", {
      details: error.message
    })
  }
})
