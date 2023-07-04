import { Database } from "../types"
import { UserRecord } from "firebase-admin/auth"
import { TopicSubscription } from "./types"
import { removeTopicSubscription } from "./removeTopicSubscription"
import { Timestamp } from "../firebase"

export const unsubscribeToOrgTopic = async ({
  user,

  orgLookup,
  db
}: {
  user: UserRecord
  orgLookup: { profileId: string; fullName: string }
  db: Database
}) => {
  const uid = user.uid
  const topicName = `org-${orgLookup.profileId.toString()}`
  const subscriptionData: TopicSubscription = {
    topicName,
    uid,
    type: "org",

    orgLookup,
    nextDigestAt: Timestamp.fromDate(new Date())
  }

  await removeTopicSubscription({ user, subscriptionData, db })
}
