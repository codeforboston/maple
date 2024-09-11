// Sets up a document trigger for /events and queries the activeTopicSubscriptions collection group in Firestore
// for all subscriptions for the given topic event, then creates a notification document in the user's notification feed.
// This function runs every time a new topic event is created in the /events collection.
// Creates a notification document in the user's notification feed for each active subscription.

// Import necessary Firebase modules
import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { Timestamp } from "../firebase"
import { BillNotification, OrgNotification } from "./types"

// Get a reference to the Firestore database
const db = admin.firestore()

const createNotificationFields = (
  entity: BillNotification | OrgNotification
) => {
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
      topicName = `org-${entity.orgId}`
      header = entity.billName
      court = entity.billCourt
      bodyText = entity.testimonyContent
      subheader = entity.testimonyUser
      break

    default:
      console.log(`Invalid entity: ${entity}`)
      throw new Error(`Invalid entity: ${entity}`)
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
    const topic = snapshot?.after.data() as
      | BillNotification
      | OrgNotification
      | undefined

    if (!topic) {
      console.error("Invalid topic data:", topic)
      return
    }

    // Extract related Bill or Org data from the topic event
    const notificationPromises: any[] = []

    // Create a batch
    const batch = db.batch()
    console.log(`topic type: ${topic.type}`)

    const handleNotifications = async (
      topic: BillNotification | OrgNotification
    ) => {
      const notificationFields = createNotificationFields(topic)

      console.log(JSON.stringify(notificationFields))

      const topicNameSnapshot = await db
        .collectionGroup("activeTopicSubscriptions")
        .where("topicName", "==", notificationFields.topicName)
        .get()

      // Send a testimony notification to all users subscribed to the Bill
      let billSnapshot
      if (notificationFields.notification.type !== "bill") {
        billSnapshot = await db
          .collectionGroup("activeTopicSubscriptions")
          .where(
            "topicName",
            "==",
            `bill-${notificationFields.notification.court}-${notificationFields.notification.id}`
          )
          .get()
      }

      // Combine topicNameSnapshot and billSnapshot in an array
      const combinedSnapshots: any[] = []

      // Add documents from combinedSnapshots to the Map
      topicNameSnapshot.forEach(doc => {
        const data = doc.data()
        combinedSnapshots.push(data)
      })

      // If billSnapshot exists, add its documents to the Map
      if (billSnapshot) {
        billSnapshot.docs.forEach(doc => {
          const data = { ...doc.data(), type: "bill" }
          combinedSnapshots.push(data)
        })
      }

      combinedSnapshots.forEach(subscription => {
        const { uid, type } = subscription
        const newNotificationFields = {
          ...notificationFields,
          uid: uid,
          notification: {
            ...notificationFields.notification,
            type: type
          }
        }

        console.log(
          `Pushing notifications to users/${uid}/userNotificationFeed`
        )

        // Get a reference to the new notification document
        const docRef = db.collection(`users/${uid}/userNotificationFeed`).doc()

        // Add the write operation to the batch
        batch.set(docRef, newNotificationFields)
      })
    }

    await handleNotifications(topic)

    notificationPromises.push(batch.commit())
  })
