import { Database} from "../types";
import { UserRecord } from "firebase-admin/auth";
import { TopicSubscription } from "./types";

export const addTopicSubscription = async ({
  user,
  subscriptionData,
  db,
}: {
  user: UserRecord;
  subscriptionData: TopicSubscription;
  db: Database;
}) => {
  const uid = user.uid;
  const topicName = subscriptionData.topicName;

  // Add the topic subscription to the user's activeTopicSubscriptions collection
  await db
    .collection(`/users/${uid}/activeTopicSubscriptions`)
    .doc(topicName)
    .set(subscriptionData);
};
