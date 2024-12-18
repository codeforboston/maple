import * as functions from "firebase-functions"
import { unsubscribeToTestimonyTopic } from "./unsubscribeToTestimonyTopic"
import { getAuth, UserRecord } from "firebase-admin/auth"
import { getFirestore, Firestore } from "firebase-admin/firestore"

export const unfollowUser = functions.https.onCall(async (data, context) => {
  // Debug: Log the received data
  console.log("Debug: Data received in unfollowUser:", data)

  // Check for authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    )
  }

  // Runtime check for 'userLookup' property
  if (!data.hasOwnProperty("userLookup")) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "userLookup must be provided."
    )
  }

  const user: UserRecord = await getAuth().getUser(context.auth.uid)
  const userLookup = data.userLookup
  const db: Firestore = getFirestore()

  try {
    await unsubscribeToTestimonyTopic({ user, userLookup, db })
    return { status: "success", message: "User subscription removed" }
  } catch (error: any) {
    throw new functions.https.HttpsError(
      "internal",
      "Failed to unsubscribe to user",
      { details: error.message }
    )
  }
})
