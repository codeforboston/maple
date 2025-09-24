// Sets up a document trigger for /events and queries the activeTopicSubscriptions collection group in Firestore
// for all subscriptions for the given topic event, then creates a notification document in the user's notification feed.
// This function runs every time a new topic event is created in the /events collection.
// Creates a notification document in the user's notification feed for each active subscription.

// Import necessary Firebase modules
import * as functions from "firebase-functions"
import { getFirestore } from "firebase-admin/firestore"
import { Timestamp } from "../firebase"
import { TestimonySubmissionNotification } from "./types"

// Get a reference to the Firestore database
const db = getFirestore()

// Define the populateOrgNotificationEvents function
export const populateTestimonySubmissionNotificationEvents = functions.firestore
  .document("/users/{userId}/publishedTestimony/{testimonyId}")
  .onWrite(async (snapshot, context) => {
    if (!snapshot.after.exists) {
      console.error("New snapshot does not exist")
      return
    }

    const documentCreated = !snapshot.before.exists

    const oldData = snapshot.before.data()
    const newData = snapshot.after.data()

    // New testimony added
    if (documentCreated) {
      console.log("New document created")

      const newNotificationEvent: TestimonySubmissionNotification = {
        type: "testimony",

        billCourt: newData?.court.toString(),
        billId: newData?.billId,
        billName: newData?.billTitle,

        userId: newData?.authorUid,
        userRole: newData?.authorRole,
        testimonyId: context.params.testimonyId,
        testimonyUser: newData?.fullName,
        testimonyPosition: newData?.position,
        testimonyContent: newData?.content,
        testimonyVersion: newData?.version,

        updateTime: Timestamp.now()
      }

      await db.collection("/notificationEvents").add(newNotificationEvent)

      return
    }

    const oldVersion = oldData?.version
    const newVersion = newData?.version

    const testimonyChanged = oldVersion !== newVersion
    console.log(`oldVersion: ${oldVersion}, newVersion: ${newVersion}`)

    const notificationEventSnapshot = await db
      .collection("/notificationEvents")
      .where("type", "==", "org")
      .where("billCourt", "==", newData?.court.toString())
      .where("billId", "==", newData?.billId)
      .where("authorUid", "==", newData?.authorUid)
      .get()

    console.log(
      `${notificationEventSnapshot.docs} ${notificationEventSnapshot.docs.length}`
    )

    if (!notificationEventSnapshot.empty) {
      const notificationEventId = notificationEventSnapshot.docs[0].id

      if (testimonyChanged) {
        console.log("Testimony changed")

        // Update the existing notification event
        await db
          .collection("/notificationEvents")
          .doc(notificationEventId)
          .update({
            testimonyPosition: newData?.position,
            testimonyContent: newData?.content,
            testimonyVersion: newData?.version,
            updateTime: Timestamp.now()
          })
      }
    }
  })
