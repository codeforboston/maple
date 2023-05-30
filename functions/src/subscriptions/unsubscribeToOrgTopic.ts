import { Database } from "../types";
import { UserRecord } from "firebase-admin/auth";
import { TopicSubscription } from "./types";
import { removeTopicSubscription } from "./removeTopicSubscription";

export const unsubscribeToOrgTopic = async ({
    user,
    orgId,
    db,
}: {
    user: UserRecord;
    orgId: string;
    db: Database;
}) => {
    const uid = user.uid;
    const topicName = `org-${orgId.toString()}`;
  
    const subscriptionData: TopicSubscription = {
        topicName,
        uid,
        type: "org",
        orgId,
};
  
    await removeTopicSubscription({ user, subscriptionData, db });
};  