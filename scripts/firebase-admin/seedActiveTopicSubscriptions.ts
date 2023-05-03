import { Script } from "./types";
import { listAllUsers } from "./list-all-users";
import { addTopicSubscription } from "functions/src/subscriptions/addTopicSubscription";

/** Seed users with activeTopicSubscriptions */
export const script: Script = async ({ db, auth }) => {
  // For each user, add a topic subscription.
  const allUsers = await listAllUsers(auth);
  console.log(`Seeding ${allUsers.length} users with activeTopicSubscriptions`);

  for (const user of allUsers) {
    const subscriptionData = {
      topicName: "bill-example-1",
      uid: user.uid,
      billLookup: {
        billId: "example-1",
        court: "exampleCourt",
      },
      type: "bill",
    };

    await addTopicSubscription({ user, subscriptionData, db });
  }

  console.log(`Seeded ${allUsers.length} users with activeTopicSubscriptions`);
};
