import * as functions from "firebase-functions/v1"
import { subscribeToTestimonyTopic } from "./subscribeToTestimonyTopic"
import { getAuth, UserRecord } from "firebase-admin/auth"
import { getFirestore, Firestore } from "firebase-admin/firestore"

export const followUser = functions.https.onCall(async (data, context) => {
  // Debug: Log the received data
  console.log("Debug: Data received in followOrg:", data)

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
    await subscribeToTestimonyTopic({ user, userLookup, db })
    return { status: "success", message: "User subscription added" }
  } catch (error: any) {
    throw new functions.https.HttpsError(
      "internal",
      "Failed to subscribe to user",
      { details: error.message }
    )
  }
})
