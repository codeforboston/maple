import { Database } from "../types"
import { UserRecord } from "firebase-admin/auth"
import { TopicSubscription } from "./types"
import { addTopicSubscription } from "./addTopicSubscription"
import { Timestamp } from "../firebase"

export const subscribeToBillTopic = async ({
  user,
  billLookup,
  db
}: {
  user: UserRecord
  billLookup: { billId: string; court: string }
  db: Database
}) => {
  const uid = user.uid
  const topicName = `bill-${billLookup.court.toString()}-${billLookup.billId}`

  const subscriptionData: TopicSubscription = {
    topicName,
    uid,
    type: "bill",
    billLookup,
    nextDigestAt: Timestamp.fromDate(new Date())
  }

  await addTopicSubscription({ user, subscriptionData, db })
}
