import * as functions from "firebase-functions"
import { getFirestore } from "firebase-admin/firestore"
import { onCall, HttpsError } from "firebase-functions/v2/https"
import type { CallableRequest } from "firebase-functions/v2/https"
import * as logger from "firebase-functions/logger"
import { checkAuth } from "../common"

const handleGetFollowers = async (request: CallableRequest) => {
  const uid = checkAuth(request, false)

  logger.log(`[getFollowers] Finding followers for user UID: ${uid}`)

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
      logger.log(
        `[getFollowers] Found ${followerIds.length} followers for user UID: ${uid}`
      )
      return followerIds
    })
    .catch(error => {
      logger.error("[getFollowers] Caught error:", error)
      throw new HttpsError("internal", "Failed to retrieve followers.", error)
    })
}

export const getFollowers = functions.https.onCall((data, context) =>
  handleGetFollowers({ data, auth: context.auth } as CallableRequest)
)
export const getFollowersV2 = onCall(handleGetFollowers)
