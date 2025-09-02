import { getFirestore } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import { checkAuth } from "../common"

export const getFollowers = functions.https.onCall(async (_, context) => {
  const uid = checkAuth(context, false)

  functions.logger.log(`[getFollowers] Finding followers for user UID: ${uid}`)

  return await getFirestore()
    .collectionGroup("activeTopicSubscriptions")
    .where("userLookup.profileId", "==", uid)
    .get()
    .then(snapshot => {
      const followerIds = Array.from(
        new Set<string>(
          snapshot.docs
            .map(doc => doc.ref.parent.parent?.id)
            .filter((id): id is string => id !== uid)
        )
      )
      functions.logger.log(
        `[getFollowers] Found ${followerIds.length} followers for user UID: ${uid}`
      )
      return followerIds
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
