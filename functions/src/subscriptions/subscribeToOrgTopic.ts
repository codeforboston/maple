import { Database } from "../types";
import { UserRecord } from "firebase-admin/auth";
import { TopicSubscription } from "./types";
import { addTopicSubscription } from "./addTopicSubscription";

export const subscribeToOrgTopic = async ({
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
  
    await addTopicSubscription({ user, subscriptionData, db });
};  