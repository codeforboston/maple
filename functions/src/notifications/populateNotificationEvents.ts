// Sets up a document trigger for /events and queries the activeTopicSubscriptions collection group in Firestore
// for all subscriptions for the given topic event, then creates a notification document in the user's notification feed.
// This function runs every time a new topic event is created in the /events collection.
// Creates a notification document in the user's notification feed for each active subscription.

// Import necessary Firebase modules
import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { Timestamp } from "../firebase"
import { BillHistory } from "../bills/types"

// Get a reference to the Firestore database
const db = admin.firestore()

type Notification = {
  type: string
  court: string
  id: string
  name: string
  history: BillHistory
  historyUpdateTime: Timestamp
}

// Define the populateNotificationEvents function
export const populateNotificationEvents = functions.firestore
  .document("/generalCourts/{court}/bills/{billId}")
  .onWrite(async (snapshot, context) => {
    if (!snapshot.after.exists) {
      console.error("New snapshot does not exist")
      return
    }

    const documentCreated = !snapshot.before.exists

    const oldData = snapshot.before.data()
    const newData = snapshot.after.data()

    const { court } = context.params

    // New bill added
    if (documentCreated) {
      console.log("New document created")

      const newNotificationEvent: Notification = {
        type: "bill",
        court: court,
        id: newData?.id,
        name: newData?.id,
        history: newData?.history,
        historyUpdateTime: Timestamp.now()
      }

      await db.collection("/notificationEvents").add(newNotificationEvent)

      return
    }

    const oldLength = oldData?.history.length
    const newLength = newData?.history.length

    const historyChanged = oldLength !== newLength
    console.log(`oldLength: ${oldLength}, newLength: ${newLength}`)

    const notificationEventSnapshot = await db
      .collection("/notificationEvents")
      .where("name", "==", newData?.id)
      .get()

    console.log(
      `${notificationEventSnapshot.docs} ${notificationEventSnapshot.docs.length}`
    )

    if (!notificationEventSnapshot.empty) {
      const notificationEventId = notificationEventSnapshot.docs[0].id

      if (historyChanged) {
        console.log("History changed")

        // Update the existing notification event
        await db
          .collection("/notificationEvents")
          .doc(notificationEventId)
          .update({
            history: newData?.history,
            historyUpdateTime: Timestamp.now()
          })
      }
    }
  })
