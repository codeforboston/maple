// Sets up a document trigger for /events and queries the activeTopicSubscriptions collection group in Firestore
// for all subscriptions for the given topic event, then creates a notification document in the user's notification feed.
// This function runs every time a new topic event is created in the /events collection.
// Creates a notification document in the user's notification feed for each active subscription.

// Import necessary Firebase modules
import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { Timestamp } from "../firebase"

// Get a reference to the Firestore database
const db = admin.firestore()

const createNotificationFields = (
  topicEvent: { [x: string]: any; name?: any; id?: any; time?: any },
  entity: { court: any; id: string; name: string },
  type: string
) => {
  let topicName = ""
  let header = ""
  let court = null

  switch (type) {
    case "bill":
      topicName = `bill-${entity.court}-${entity.id}` // looks for fields in event document
      header = entity.id
      court = entity.court
      break
    case "org":
      topicName = `org-${entity.id}`
      header = entity.name
      break
    default:
      // handle exception for entities that don't fit schema
      console.log(`Invalid entity type: ${type}`)
      throw new Error(`Invalid entity type: ${type}`)
  }

  return {
    // set up notification document fields
    topicName,
    uid: "", // user id will be populated in the publishNotifications function
    notification: {
      bodyText: topicEvent.name, // may change depending on event type
      header,
      id: topicEvent.id,
      subheader: topicEvent.name, // may change depending on event type
      timestamp: topicEvent.time, // could also be fullDate
      type,
      court,
      delivered: false
    },
    createdAt: Timestamp.now()
  }
}

// Define the publishNotifications function
export const publishNotifications = functions.firestore
  .document("/events/{topicEventId}")
  .onCreate(async (snapshot, context) => {
    // Get the newly created topic event data
    const topicEvent = snapshot.data()

    if (!topicEvent) {
      console.error("Invalid topic event data:", topicEvent)
      return
    }

    // Extract related Bill or Org data from the topic event
    const { relatedBills, relatedOrgs } = topicEvent

    const notificationPromises: any[] = []

    // If there are related bills, create a notification document for each bill subscription
    if (relatedBills) {
      relatedBills.forEach(
        async (bill: { court: any; id: string; name: string }) => {
          const notificationFields = createNotificationFields(
            topicEvent,
            bill,
            "bill"
          )

          const subscriptionsSnapshot = await db
            .collectionGroup("activeTopicSubscriptions")
            .where("topicName", "==", notificationFields.topicName)
            .get()

          subscriptionsSnapshot.docs.forEach(doc => {
            const subscription = doc.data()
            const { uid } = subscription

            // Add the uid to the notification document
            notificationFields.uid = uid

            // Create a notification document in the user's notification feed
            notificationPromises.push(
              db
                .collection(`users/${uid}/userNotificationFeed`)
                .add(notificationFields)
            )
          })
        }
      )
    }

    // If there are related orgs, create a notification document for each org subscription
    if (relatedOrgs) {
      relatedOrgs.forEach(
        async (org: { court: any; id: string; name: string }) => {
          const notificationFields = createNotificationFields(
            topicEvent,
            org,
            "org"
          )

          const subscriptionsSnapshot = await db
            .collectionGroup("activeTopicSubscriptions")
            .where("topicName", "==", notificationFields.topicName)
            .get()

          subscriptionsSnapshot.docs.forEach(doc => {
            const subscription = doc.data()
            const { uid } = subscription

            // Add the uid to the notification document
            notificationFields.uid = uid

            // Create a notification document in the user's notification feed
            notificationPromises.push(
              db
                .collection(`users/${uid}/userNotificationFeed`)
                .add(notificationFields)
            )
          })
        }
      )
    }

    // Wait for all notification documents to be created
    await Promise.all(notificationPromises)
  })
