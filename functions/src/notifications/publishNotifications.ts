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
  entity: {
    court: any
    id: string
    name: string
    history: string
    lastUpdatedTime: any
  }, // history is an array, it needs to be concatenated
  type: string
) => {
  let topicName = ""
  let header = ""
  let court = null
  switch (type) {
    case "bill":
      topicName = `bill-${entity.court}-${entity.id}` // looks for fields in event document
      header = entity.name
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
      bodyText: entity.history, // may change depending on event type
      header,
      id: entity.id,
      subheader: "Do we need a sub heading", // may change depending on event type
      timestamp: entity.lastUpdatedTime, // could also be fullDate ; might need to remove this all together
      type,
      court,
      delivered: false
    },
    createdAt: Timestamp.now()
  }
}

// Define the publishNotifications function
export const publishNotifications = functions.firestore
  .document("/notificationEvents/{topicEventId}")
  .onWrite(async (snapshot, context) => {
    // Get the newly created topic event data
    const topic = snapshot?.after.data()

    if (!topic) {
      console.error("Invalid topic data:", topic)
      return
    }

    // Extract related Bill or Org data from the topic event

    const notificationPromises: any[] = []
    console.log(`topic type: ${topic.type}`)

    if (topic.type == "bill") {
      console.log("bill")

      const handleBillNotifications = async (topic: {
        court: any
        id: string
        name: string
        history: string
        lastUpdatedTime: any
      }) => {
        const notificationFields = createNotificationFields(topic, "bill")

        console.log(JSON.stringify(notificationFields))

        const subscriptionsSnapshot = await db
          .collectionGroup("activeTopicSubscriptions")
          .where("topicName", "==", notificationFields.topicName)
          .get()

        subscriptionsSnapshot.docs.forEach(doc => {
          const subscription = doc.data()
          const { uid } = subscription

          // Add the uid to the notification document
          notificationFields.uid = uid

          console.log(
            `Pushing notifications to users/${uid}/userNotificationFeed`
          )

          // Create a notification document in the user's notification feed
          notificationPromises.push(
            db
              .collection(`users/${uid}/userNotificationFeed`)
              .add(notificationFields)
          )
        })
      }

      await handleBillNotifications({
        court: topic.court,
        id: topic.id,
        name: topic.name,
        history: JSON.stringify(topic.history),
        lastUpdatedTime: topic.historyUpdateTime
      })
    }

    // Wait for all notification documents to be created
    await Promise.all(notificationPromises)
  })
