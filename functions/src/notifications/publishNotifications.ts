// Sets up a document trigger for /events and queries the activeTopicSubscriptions collection group in Firestore
// for all subscriptions for the given topic event, then creates a notification document in the user's notification feed.
// This function runs every time a new topic event is created in the /events collection.
// Creates a notification document in the user's notification feed for each active subscription.

// Import necessary Firebase modules
import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { Timestamp } from "../firebase"
import { Notification } from "./populateBillNotificationEvents"

// Get a reference to the Firestore database
const db = admin.firestore()

const createNotificationFields = (entity: Notification) => {
  let topicName: string
  let header: string
  let court: string | null = null
  let bodyText: string
  let subheader: string

  switch (entity.type) {
    case "bill":
      topicName = `bill-${entity.billCourt}-${entity.billId}`
      header = entity.billId
      court = entity.billCourt
      if (entity.billHistory.length < 1) {
        console.log(`Invalid history length: ${entity.billHistory.length}`)
        throw new Error(`Invalid history length: ${entity.billHistory.length}`)
      }
      let lastHistoryAction = entity.billHistory[entity.billHistory.length - 1]
      bodyText = `${lastHistoryAction.Action}`
      subheader = `${lastHistoryAction.Branch}`
      break

    case "org":
      topicName = `org-${entity.testimonyUser}`
      header = entity.billName
      bodyText = entity.testimonyContent
      subheader = entity.testimonyUser
      break

    default:
      console.log(`Invalid entity type: ${entity.type}`)
      throw new Error(`Invalid entity type: ${entity.type}`)
  }
  
  return {
    topicName,
    uid: "",
    notification: {
      bodyText: bodyText,
      header,
      id: entity.billId,
      subheader: subheader,
      timestamp: entity.updateTime,
      type: entity.type,
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
    const topic = snapshot?.after.data() as Notification | undefined

    if (!topic) {
      console.error("Invalid topic data:", topic)
      return
    }

    // Extract related Bill or Org data from the topic event
    const notificationPromises: any[] = []
    console.log(`topic type: ${topic.type}`)

    const handleNotifications = async (topic: Notification) => {
      const notificationFields = createNotificationFields(topic)

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

        console.log(`Pushing notifications to users/${uid}/userNotificationFeed`)

        // Create a notification document in the user's notification feed
        notificationPromises.push(
          db
            .collection(`users/${uid}/userNotificationFeed`)
            .add(notificationFields)
        )
      })
    }

    await handleNotifications(topic)

    // Wait for all notification documents to be created
    await Promise.all(notificationPromises)
  })
