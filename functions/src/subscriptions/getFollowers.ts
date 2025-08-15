import { FieldPath, getFirestore } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import { checkAuth } from "../common"

export const getFollowers = functions.https.onCall(async (_, context) => {
  const uid = checkAuth(context, false)

  functions.logger.log(`[getFollowers] Finding followers for user UID: ${uid}`)

  const firestore = getFirestore()

  return await firestore
    .collectionGroup("activeTopicSubscriptions")
    .where("userLookup.profileId", "==", uid)
    .get()
    .then(snapshot => {
      const followerProfileIds = Array.from(
        // use a set to deduplicate
        new Set(
          snapshot.docs
            .map(doc => doc.ref.parent.parent!.id)
            .filter(id => id != uid)
        )
      )

      functions.logger.log(
        `[getFollowers] Found ${followerProfileIds.length} followers for user UID: ${uid}`
      )

      return firestore
        .collection("profiles")
        .where(FieldPath.documentId(), "in", followerProfileIds)
        .get()
        .then(snapshot =>
          snapshot.docs.map(doc => ({ profileId: doc.id, ...doc.data() }))
        )
    })
    .catch(error => {
      functions.logger.error("[getFollowers] Caught error:", error)
      throw new functions.https.HttpsError(
        "internal",
        "Failed to retrieve followers.",
        error
      )
    })
})
