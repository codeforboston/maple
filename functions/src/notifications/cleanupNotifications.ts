import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { Timestamp } from "../../../common/types"

const RETENTION_PERIOD_DAYS = 60

// Get a reference to the Firestore database
const db = admin.firestore()

// TODO
// 1.) Do we actually want to delete old notifications? (check with Matt V)
// 2.) Do we actually want to delete old notificaiton events? Why not keep the history?
// 3.) Should we just use the builtin TTL feature for all of these?
// 4.) Should we use a bulk delete operation for firestore for all of these?

// Delete old notifications from userNotificationFeed collections
const cleanupUserNotificationFeed = async (threshold: Timestamp) => {
  const notificationsSnapshot = await db
    .collectionGroup("userNotificationFeed")
    .where("createdAt", "<", threshold)
    .get()

  const deleteNotificationPromises = notificationsSnapshot.docs.map(doc =>
    doc.ref.delete()
  )
  await Promise.all(deleteNotificationPromises)
}

const cleanupNotificationEvents = async (threshold: Timestamp) => {
  // Delete old topic events from the events collection
  const notificationEventsSnapshot = await db
    .collection("notificationEvents")
    .where("createdAt", "<", threshold)
    .get()

  const deleteNotificationEventPromises = notificationEventsSnapshot.docs.map(
    doc => doc.ref.delete()
  )
  await Promise.all(deleteNotificationEventPromises)
}

const cleanupNotificationEmails = async (threshold: Timestamp) => {
  // Delete old email documents from the emails collection
  const emailsSnapshot = await db
    .collection("emails")
    .where("createdAt", "<", threshold)
    .get()

  const deleteEmailPromises = emailsSnapshot.docs.map(doc => doc.ref.delete())
  await Promise.all(deleteEmailPromises)
}

const runCleanupNotifications = async () => {
  // todo better date math
  // Define the time threshold for old notifications, topic events, and email documents
  const threshold = new Timestamp(
    Date.now() - RETENTION_PERIOD_DAYS * 24 * 60 * 60 * 1000,
    0
  )

  await cleanupUserNotificationFeed(threshold)
  await cleanupNotificationEvents(threshold)
  await cleanupNotificationEmails(threshold)
}

// Define the cleanupNotifications function
export const cleanupNotifications = functions.pubsub
  .schedule("every 24 hours")
  .onRun(runCleanupNotifications)

export const httpsCleanupNotifications = functions.https.onRequest(
  async (request, response) => {
    try {
      console.log("httpsCleanupNotifications triggered")
      await runCleanupNotifications()
      console.log("DEBUG: cleanupNotifications completed")

      response
        .status(200)
        .send(
          "Successfully cleaned up old notifications, topic events, and email documents"
        )
    } catch (error) {
      console.error("Error in httpsCleanupNotifications:", error)
      response.status(500).send("Internal server error")
    }
  }
)
