// Sets up a document trigger for /events and queries the activeTopicSubscriptions collection group in Firestore
// for all subscriptions for the given topic event, then creates a notification document in the user's notification feed.
// This function runs every time a new topic event is created in the /events collection.
// Creates a notification document in the user's notification feed for each active subscription.

// Import necessary Firebase modules
import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { Timestamp } from "../firebase"
import {
  BillHistoryUpdateNotification,
  TestimonySubmissionNotification
} from "./types"
import { cloneDeep } from "lodash"

// Get a reference to the Firestore database
const db = admin.firestore()

const createNotificationFields = (
  entity: BillHistoryUpdateNotification | TestimonySubmissionNotification
) => {
  let bodyText: string
  let subheader: string
  let position: string | undefined

  switch (entity.type) {
    case "bill":
      if (entity.billHistory.length < 1) {
        console.log(`Invalid history length: ${entity.billHistory.length}`)
        throw new Error(`Invalid history length: ${entity.billHistory.length}`)
      }
      let lastHistoryAction = entity.billHistory[entity.billHistory.length - 1]
      bodyText = `${lastHistoryAction.Action}`
      subheader = `${lastHistoryAction.Branch}`
      break

    case "testimony":
      bodyText = entity.testimonyContent
      subheader = entity.testimonyUser
      position = entity.testimonyPosition
      break

    default:
      console.log(`Invalid entity: ${entity}`)
      throw new Error(`Invalid entity: ${entity}`)
  }

  return {
    uid: "",
    notification: {
      bodyText: bodyText,
      header: entity.billId,
      court: entity.billCourt,
      id: entity.billId,
      subheader: subheader,
      timestamp: entity.updateTime,
      type: entity.type,
      position: position ?? "",
      isBillMatch: false,
      isUserMatch: false,
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
      | BillHistoryUpdateNotification
      | TestimonySubmissionNotification
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
      topic: BillHistoryUpdateNotification | TestimonySubmissionNotification
    ) => {
      const notificationFields = createNotificationFields(topic)

      const topicNameSnapshot = await db
        .collectionGroup("activeTopicSubscriptions")
        .where(
          "topicName",
          "in",
          topic.type === "bill"
            ? [`bill-${topic.billCourt}-${topic.billId}`]
            : [
                `testimony-${topic.userId}`,
                `bill-${topic.billCourt}-${topic.billId}`
              ]
        )
        .get()

      const users: { [uid: string]: any } = {}

      // Iterate through the topicNameSnapshots and set the notifications
      topicNameSnapshot.forEach(subscription => {
        const { uid, type } = subscription.data()
        if (topic.type === "testimony" && topic.userId !== uid) {
          // If the user does not exist, create new notificationFields for the user
          if (!users[uid]) {
            users[uid] = cloneDeep(notificationFields)
            users[uid].uid = uid
          }

          // Set isUserMatch or isBillMatch based on the type of notification from the topic subscription
          users[uid].notification[
            type === "testimony" ? "isUserMatch" : "isBillMatch"
          ] = true
        }
      })

      // Iterate through users and set the notifications
      Object.values(users).forEach(user => {
        const { uid } = user
        console.log(
          `Pushing notifications to users/${uid}/userNotificationFeed`
        )
        // Get a reference to the new notification document
        const docRef = db.collection(`users/${uid}/userNotificationFeed`).doc()

        // Add the write operation to the batch
        batch.set(docRef, user)
      })
    }

    await handleNotifications(topic)

    notificationPromises.push(batch.commit())
  })
