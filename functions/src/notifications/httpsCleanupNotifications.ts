// Import necessary Firebase modules and libraries
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp} from "../firebase"

// Get a reference to the Firestore database
const db = admin.firestore();

// Define the cleanupNotifications function
export const httpsCleanupNotifications = functions.https.onRequest(async (request, response) => {
    try {
      console.log('httpCleanupNotifications triggered');

      // Define the time threshold for old notifications, topic events, and email documents
      const retentionPeriodDays = 60; // Adjust this value as needed
      const threshold = Timestamp.fromMillis(
        Date.now() - retentionPeriodDays * 24 * 60 * 60 * 1000,
      );

      // Delete old notifications from userNotificationFeed collections
      const notificationsSnapshot = await db
        .collectionGroup('userNotificationFeed')
        .where('createdAt', '<', threshold)
        .get();

      const deleteNotificationPromises = notificationsSnapshot.docs.map((doc) => doc.ref.delete());
      await Promise.all(deleteNotificationPromises);

      // Delete old topic events from the events collection
      const eventsSnapshot = await db
        .collection('events')
        .where('createdAt', '<', threshold)
        .get();

      const deleteTopicEventPromises = eventsSnapshot.docs.map((doc) => doc.ref.delete());
      await Promise.all(deleteTopicEventPromises);

      // Delete old email documents from the notifications_mails collection
      const emailsSnapshot = await db
        .collection('notifications_mails')
        .where('createdAt', '<', threshold)
        .get();

      const deleteEmailPromises = emailsSnapshot.docs.map((doc) => doc.ref.delete());
      await Promise.all(deleteEmailPromises);

      console.log('DEBUG: cleanupNotifications completed');
      
      response.status(200).send('Successfully cleaned up old notifications, topic events, and email documents');
    } catch (error) {
      console.error('Error in cleanupNotifications:', error);
      response.status(500).send('Internal server error');
    }
});
