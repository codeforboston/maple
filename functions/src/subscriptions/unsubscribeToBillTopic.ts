import { Database } from "../types"
import { UserRecord } from "firebase-admin/auth"
import { TopicSubscription } from "./types"
import { removeTopicSubscription } from "./removeTopicSubscription"

export const unsubscribeToBillTopic = async ({
  user,
  billLookup,
  db
}: {
  user: UserRecord
  billLookup: { billId: string; court: string }
  db: Database
}) => {
  if (!billLookup || !billLookup.billId || !billLookup.court) {
    throw new Error("billLookup, billId, or court is not defined")
  }
  try {
    const uid = user.uid
    const topicName = `bill-${billLookup.court.toString()}-${billLookup.billId}`

    const subscriptionData: TopicSubscription = {
      topicName,
      uid,
      type: "bill",
      billLookup
    }

    await removeTopicSubscription({ user, subscriptionData, db })
  } catch (error) {
    console.error("Error in unsubscribeToBillTopic:", error)
    throw error
  }
}
