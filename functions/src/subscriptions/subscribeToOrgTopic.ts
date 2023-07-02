import { Database } from "../types";
import { UserRecord } from "firebase-admin/auth";
import { TopicSubscription } from "./types";
import { addTopicSubscription } from "./addTopicSubscription";
import { Timestamp } from "../firebase";

export const subscribeToOrgTopic = async ({
    user,
    orgLookup,
    db,
}: {
    user: UserRecord;
    orgLookup: {profileId: string, fullName: string};
    db: Database;
}) => {
    const uid = user.uid;
    const topicName = `org-${orgLookup.profileId.toString()}`;
  
    const subscriptionData: TopicSubscription = {
        topicName,
        uid,
        type: "org",
        orgLookup,
        nextDigestAt: Timestamp.fromDate(new Date()),
    };
  
    await addTopicSubscription({ user, subscriptionData, db });
};  