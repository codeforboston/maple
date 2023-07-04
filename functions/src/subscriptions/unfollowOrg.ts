import * as functions from "firebase-functions"
import { unsubscribeToOrgTopic } from "./unsubscribeToOrgTopic"
import { getAuth, UserRecord } from "firebase-admin/auth"
import { getFirestore, Firestore } from "firebase-admin/firestore"

export const unfollowOrg = functions.https.onCall(async (data, context) => {
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
    await unsubscribeToOrgTopic({ user, orgLookup, db })
    return { status: "success", message: "Org subscription removed" }
  } catch (error: any) {
    throw new functions.https.HttpsError(
      "internal",
      "Failed to unsubscribe to org",
      { details: error.message }
    )
  }
})
