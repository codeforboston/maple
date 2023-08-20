import * as functions from "firebase-functions"
import { subscribeToOrgTopic } from "./subscribeToOrgTopic"
import { getAuth, UserRecord } from "firebase-admin/auth"
import { getFirestore, Firestore } from "firebase-admin/firestore"

export const followOrg = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    )
  }

  const user: UserRecord = await getAuth().getUser(context.auth.uid) // Get user based on UID
  const orgLookup = data.orgLookup
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
