import { Database } from "../types"
import { UserRecord } from "firebase-admin/auth"
import { TopicSubscription } from "./types"
import { removeTopicSubscription } from "./removeTopicSubscription"
import { Timestamp } from "../firebase"

export const unsubscribeToTestimonyTopic = async ({
  user,
  userLookup,
  db
}: {
  user: UserRecord
  userLookup: { profileId: string; fullName: string }
  db: Database
}) => {
  try {
    // Debug: Log the input parameters
    console.log("Debug: User", user)
    console.log("Debug: userLookup", userLookup)

    const uid = user.uid
    const topicName = `testimony-${userLookup.profileId.toString()}`

    // Debug: Log the generated uid and topicName
    console.log("Debug: UID", uid)
    console.log("Debug: Topic Name", topicName)

    const subscriptionData: TopicSubscription = {
      topicName,
      uid,
      type: "testimony",
      userLookup,
      nextDigestAt: Timestamp.fromDate(new Date())
    }

    // Debug: Log the subscription data
    console.log("Debug: Subscription Data", subscriptionData)

    await removeTopicSubscription({ user, subscriptionData, db })

    // Debug: Log success
    console.log("Debug: Subscription removed successfully")
  } catch (error) {
    // Debug: Log any errors
    console.error("Debug: Error in unsubscribeToOrgTopic", error)
  }
}
