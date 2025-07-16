// Sets up a document trigger for /events and queries the activeTopicSubscriptions collection group in Firestore
// for all subscriptions for the given topic event, then creates a notification document in the user's notification feed.
// This function runs every time a new topic event is created in the /events collection.
// Creates a notification document in the user's notification feed for each active subscription.

// Import necessary Firebase modules
import * as functions from "firebase-functions"
import { getFirestore } from "firebase-admin/firestore"
import { Timestamp } from "../firebase"
import { BillHistoryUpdateNotification } from "./types"

// Get a reference to the Firestore database
const db = getFirestore()

// Define the populateBillNotificationEvents function
export const populateBillHistoryNotificationEvents = functions.firestore
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

    // Create a notification event
    const createNotificationEvent = async (
      data: FirebaseFirestore.DocumentData
    ) => {
      const notificationEvent: BillHistoryUpdateNotification = {
        type: "bill",
        billCourt: court,
        billId: data?.id,
        billName: data?.content.Title,
        billHistory: data?.history,
        updateTime: Timestamp.now()
      }

      await db.collection("/notificationEvents").add(notificationEvent)
      return
    }

    const oldLength = oldData?.history.length
    const newLength = newData?.history.length

    const historyChanged = oldLength !== newLength
    console.log(`oldLength: ${oldLength}, newLength: ${newLength}`)

    if (!historyChanged) {
      console.log(
        "Bill History unchanged, skipping notification event creation/update"
      )
      return
    }

    // New bill added
    if (documentCreated && newData) {
      console.log("New Bill History notification event created")

      await createNotificationEvent(newData)

      return
    }

    const notificationEventSnapshot = await db
      .collection("/notificationEvents")
      .where("type", "==", "bill")
      .where("billCourt", "==", court)
      .where("billId", "==", newData?.id)
      .get()

    console.log(
      `${notificationEventSnapshot.docs} ${notificationEventSnapshot.docs.length}`
    )

    if (!notificationEventSnapshot.empty) {
      const notificationEventId = notificationEventSnapshot.docs[0].id

      if (historyChanged) {
        console.log("History changed, updating existing notification event")

        // Update the existing notification event
        await db
          .collection("/notificationEvents")
          .doc(notificationEventId)
          .update({
            billHistory: newData?.history,
            updateTime: Timestamp.now()
          })
      }
    } else {
      console.log(
        "No existing notification event found, creating new notification event"
      )

      if (newData) {
        await createNotificationEvent(newData)
      }
    }
  })
