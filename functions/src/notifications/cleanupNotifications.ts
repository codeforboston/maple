// Function that runs periodically and deletes old notifications, topic events, and email documents.

// Import necessary Firebase modules and libraries
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Get a reference to the Firestore database
const db = admin.firestore();

// Define the cleanupNotifications function
export const cleanupNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // Define the time threshold for old notifications, topic events, and email documents
    const retentionPeriodDays = 30; // Adjust this value as needed
    const threshold = admin.firestore.Timestamp.fromMillis(
      Date.now() - retentionPeriodDays * 24 * 60 * 60 * 1000,
    );

    // Delete old notifications from userNotificationFeed collections
    const notificationsSnapshot = await db
      .collectionGroup('userNotificationFeed')
      .where('createdAt', '<', threshold)
      .get();

    const deleteNotificationPromises = notificationsSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deleteNotificationPromises);

    // Delete old topic events from the topicEvents collection
    const topicEventsSnapshot = await db
      .collection('topicEvents')
      .where('createdAt', '<', threshold)
      .get();

    const deleteTopicEventPromises = topicEventsSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deleteTopicEventPromises);

    // Delete old email documents from the notifications_mails collection
    const emailsSnapshot = await db
      .collection('notifications_mails')
      .where('createdAt', '<', threshold)
      .get();

    const deleteEmailPromises = emailsSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deleteEmailPromises);
  });
