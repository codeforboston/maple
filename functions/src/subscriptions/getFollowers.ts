import { getFirestore } from "firebase-admin/firestore"
import * as functions from "firebase-functions"

export interface GetFollowersRequest {
  uid: string
}
export type GetFollowersResponse = string[]

export const getFollowers = functions.https.onCall(
  async ({ uid }: GetFollowersRequest, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      )
    }

    functions.logger.log(
      `[getFollowers] Finding followers for user UID: ${uid}`
    )

    return await getFirestore()
      .collectionGroup("activeTopicSubscriptions")
      .where("userLookup.profileId", "==", uid)
      .get()
      .then(snapshot => {
        const followers = new Set<string>()
        snapshot.forEach(doc => {
          const followerUid = doc.ref.parent.parent?.id
          if (followerUid && followerUid !== uid) followers.add(followerUid)
        })
        functions.logger.log(
          `[getFollowers] Found ${followers.size} followers for user UID: ${uid}`
        )
        return Array.from(followers)
      })
      .catch(error => {
        functions.logger.error("[getFollowers] Caught error:", error)
        throw new functions.https.HttpsError(
          "internal",
          "Failed to retrieve followers and reciprocal status.",
          error
        )
      })
  }
)
