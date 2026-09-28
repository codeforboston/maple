import * as functions from "firebase-functions"
import { onCall, HttpsError } from "firebase-functions/v2/https"
import type { CallableRequest } from "firebase-functions/v2/https"
import { unsubscribeToTestimonyTopic } from "./unsubscribeToTestimonyTopic"
import { getAuth, UserRecord } from "firebase-admin/auth"
import { getFirestore, Firestore } from "firebase-admin/firestore"

const handleUnfollowUser = async (request: CallableRequest) => {
  // Debug: Log the received data
  console.log("Debug: Data received in unfollowUser:", request.data)

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
    await unsubscribeToTestimonyTopic({ user, userLookup, db })
    return { status: "success", message: "User subscription removed" }
  } catch (error: any) {
    throw new HttpsError("internal", "Failed to unsubscribe to user", {
      details: error.message
    })
  }
}

export const unfollowUser = functions.https.onCall((data, context) =>
  handleUnfollowUser({ data, auth: context.auth } as CallableRequest)
)
export const unfollowUserV2 = onCall(handleUnfollowUser)
