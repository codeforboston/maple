import { Database } from "../types"
import { UserRecord } from "firebase-admin/auth"
import { TopicSubscription } from "./types"
import { addTopicSubscription } from "./addTopicSubscription"
import { Timestamp } from "../firebase"

export const subscribeToOrgTopic = async ({
  user,
  orgLookup,
  db
}: {
  user: UserRecord
  orgLookup: { profileId: string; fullName: string }
  db: Database
}) => {
  try {
    // Debug: Log the input parameters
    console.log("Debug: User", user)
    console.log("Debug: OrgLookup", orgLookup)

    const uid = user.uid
    const topicName = `org-${orgLookup.profileId.toString()}`

    // Debug: Log the generated uid and topicName
    console.log("Debug: UID", uid)
    console.log("Debug: Topic Name", topicName)

    const subscriptionData: TopicSubscription = {
      topicName,
      uid,
      type: "org",
      orgLookup,
      nextDigestAt: Timestamp.fromDate(new Date())
    }

    // Debug: Log the subscription data
    console.log("Debug: Subscription Data", subscriptionData)

    await addTopicSubscription({ user, subscriptionData, db })

    // Debug: Log success
    console.log("Debug: Subscription added successfully")
  } catch (error) {
    // Debug: Log any errors
    console.error("Debug: Error in subscribeToOrgTopic", error)
  }
}
