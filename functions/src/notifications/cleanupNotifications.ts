import * as functions from "firebase-functions"
import { getFirestore } from "firebase-admin/firestore"
import { Timestamp } from "../firebase"

const RETENTION_PERIOD_DAYS = 60

// Get a reference to the Firestore database
const db = getFirestore()

// TODO
// 1.) Do we actually want to delete old notifications? (check with Matt V)
// 2.) Do we actually want to delete old notificaiton events? Why not keep the history?
// 3.) We should just use the builtin TTL feature for all of these, right?
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
