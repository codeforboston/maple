import { Database } from "../types";
import { UserRecord } from "firebase-admin/auth";
import { TopicSubscription } from "./types";
import { removeTopicSubscription } from "./removeTopicSubscription";

export const unsubscribeToBillTopic = async ({
    user,
    billLookup,
    db,
}: {
    user: UserRecord;
    billLookup: { billId: string; court: string };
    db: Database;
}) => {
    const uid = user.uid;
    const topicName = `bill-${billLookup.court.toString()}-${billLookup.billId}`;

    const subscriptionData: TopicSubscription = {
        topicName,
        uid,
        type: "bill",
        billLookup,
  };

    await removeTopicSubscription({ user, subscriptionData, db });
};