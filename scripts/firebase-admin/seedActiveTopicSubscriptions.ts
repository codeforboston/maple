import { Script } from "./types"
import { listAllUsers } from "./list-all-users"
import { addTopicSubscription } from "functions/src/subscriptions/addTopicSubscription"
import * as admin from "firebase-admin"
import { Timestamp } from "../../common/types"

/** Seed users with activeTopicSubscriptions */
export const script: Script = async ({ db, auth }) => {
  // For each user, add a topic subscription.
  const allUsers = await listAllUsers(auth)
  console.log(
    `Seeding ${allUsers.length} users with a topic subscription for bill-example-1 and org-example-1`
  )

  const now = Timestamp.fromDate(new Date())
  const monthAhead = new Date(now.toDate())
  monthAhead.setMonth(monthAhead.getMonth() + 1)

  for (const user of allUsers) {
    const subscriptionData = {
      topicName: "bill-exampleCourt-bill1",
      uid: user.uid,
      billLookup: {
        billId: "bill1",
        court: "exampleCourt"
      },
      public: true,
      type: "bill"
    }

    await addTopicSubscription({ user, subscriptionData, db })
  }

  // before adding the org subscription, create profile for org1
  await db
    .collection("profiles")
    .doc("nceMDdeA4zV9Qzo0rBOjoRrMjq53")
    .set({
      displayName: "Tammy's Tamales",
      fullName: "Tammy's Tamales",
      orgCategories: ["Agriculture", "Food"],
      public: true,
      representative: {
        district: "7th Hampden",
        id: "ALS1",
        name: "Aaron Vega"
      },
      role: "organization",
      senator: {
        district: "Hampden",
        id: "ALS2",
        name: "James Welch"
      }
    })

  for (const user of allUsers) {
    const subscriptionData = {
      topicName: "testimony-nceMDdeA4zV9Qzo0rBOjoRrMjq53",
      uid: user.uid,
      userLookup: {
        profileId: "nceMDdeA4zV9Qzo0rBOjoRrMjq53",
        fullName: "Tammy's Tamales"
      },
      public: true,
      type: "testimony"
    }

    await addTopicSubscription({ user, subscriptionData, db })
  }

  console.log(`Seeded ${allUsers.length} users with activeTopicSubscriptions`)
}
