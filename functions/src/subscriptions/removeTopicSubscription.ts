import { Database} from "../types";
import { UserRecord } from "firebase-admin/auth";
import { TopicSubscription } from "./types";

export const removeTopicSubscription = async ({
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

  // Remove the topic subscription from the user's activeTopicSubscriptions collection
  try {
    await db
      .collection(`/users/${uid}/activeTopicSubscriptions`)
      .doc(topicName)
      .delete();
  } catch (error: any) {
    console.error('Error removing topic subscription: ', error);
  }
};

