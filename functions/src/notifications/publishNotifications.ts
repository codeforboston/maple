// Path: functions/src/shared/publishNotifications.ts
// Sets up a document trigger for /topicEvents and queries the activeTopicSubscriptions collection group in Firestore for all subscriptions for the given topic event, then creates a notification document in the user's notification feed. 
// This function runs every time a new topic event is created in the /topicEvents collection.
// Creates a notification document in the user's notification feed for each active subscription.

// Import necessary Firebase modules
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Get a reference to the Firestore database
const db = admin.firestore();

// Define the publishNotifications function
export const publishNotifications = functions.firestore
  .document('/topicEvents/{topicEventId}')
  .onCreate(async (snapshot, context) => {
    // Get the newly created topic event data
    const topicEvent = snapshot.data();

    if (!topicEvent) {
      console.error('Invalid topic event data:', topicEvent);
      return;
    }

    // Extract the topicId from the topic event
    const { topicId } = topicEvent;

    // Query the activeTopicSubscriptions collection group for all subscriptions for the given topic event
    const subscriptionsSnapshot = await db
      .collectionGroup('activeTopicSubscriptions')
      .where('topicId', '==', topicId)
      .get();

    // Iterate through each subscription and create a notification document in the user's notification feed
    const notificationPromises = subscriptionsSnapshot.docs.map(async (doc) => {
      const subscription = doc.data();
      const { userId } = subscription;

      // Create a notification document in the user's notification feed
      return db
        .collection(`users/${userId}/userNotificationFeed`)
        .add({
          ...topicEvent,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });

    // Wait for all notification documents to be created
    await Promise.all(notificationPromises);
  });
