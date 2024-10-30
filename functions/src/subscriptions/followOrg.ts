import * as functions from "firebase-functions"
import { subscribeToOrgTopic } from "./subscribeToOrgTopic"
import { getAuth, UserRecord } from "firebase-admin/auth"
import { getFirestore, Firestore } from "firebase-admin/firestore"
import { onCall } from "firebase-functions/v2/https"

export const followOrg = onCall(async request => {
  // Debug: Log the received data
  console.log("Debug: Data received in followOrg:", request.data)

  // Check for authentication
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    )
  }

  // Runtime check for 'orgLookup' property
  if (!request.data.hasOwnProperty("orgLookup")) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "orgLookup must be provided."
    )
  }

  const user: UserRecord = await getAuth().getUser(request.auth.uid)
  const orgLookup = request.data.orgLookup
  const db: Firestore = getFirestore()

  try {
    await subscribeToOrgTopic({ user, orgLookup, db })
    return { status: "success", message: "Org subscription added" }
  } catch (error: any) {
    throw new functions.https.HttpsError(
      "internal",
      "Failed to subscribe to org",
      { details: error.message }
    )
  }
})
