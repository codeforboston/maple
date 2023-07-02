const functions = require('firebase-functions');
import * as admin from 'firebase-admin';
import { Timestamp } from "../firebase"


export const updateUserNotificationFrequency = functions.firestore
    .document('profiles/{userId}')
    .onWrite(async (change: { before: { data: () => any; }; after: { data: () => any; }; }, context: { params: { userId: any; }; }) => {
        const userId = context.params.userId;
        const docBeforeChange = change.before.data();
        const docAfterChange = change.after.data();

        // console.log(`DEBUG: Function invoked for userId: ${userId}`); // Debug statement

        const isAnUpdate =
            docBeforeChange &&
            docBeforeChange.notificationFrequency !== docAfterChange.notificationFrequency;

        const isACreation = docBeforeChange === undefined;

        if (!isAnUpdate && !isACreation) {
            console.warn(`Not an update or creation for userId: ${userId}, function will return without changes.`);
            return null;
        }

        const notificationFrequency = docAfterChange.notificationFrequency;
        const email = docAfterChange.email;

        // console.log(`DEBUG: New notification frequency for userId: ${userId} is ${notificationFrequency}`); // Debug statement
        // console.log(`DEBUG: New email for userId: ${userId} is ${email}`); // Debug statement

        // Check if notification frequency is undefined
        if (!notificationFrequency) {
            console.log(`Notification frequency for user ${userId} is undefined.`);
            return null;
        }

        // Update user document in the 'users' collection
        await admin.firestore().collection('users').doc(userId).set({
            notificationFrequency: notificationFrequency,
            email: email
        }, { merge: true });

        // console.log(`DEBUG: Updated notification frequency in users collection for userId: ${userId}`); // Debug statement

        // Update all documents in the 'activeTopicSubscriptions' sub-collection
        const now = Timestamp.now();
        let nextDigestAt: admin.firestore.Timestamp | null;
        switch (notificationFrequency) {
            case "Daily":
              nextDigestAt = Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000);
              break;
            case "Weekly":
              nextDigestAt = Timestamp.fromMillis(now.toMillis() + 7 * 24 * 60 * 60 * 1000);
              break;
            case "Monthly":
              const monthAhead = new Date(now.toDate());
              monthAhead.setMonth(monthAhead.getMonth() + 1);
              nextDigestAt = Timestamp.fromDate(monthAhead);
              break;
            case "None":
              nextDigestAt = null;
              break;
            default:
              console.error(`Unknown notification frequency: ${notificationFrequency}`);
              break;
          }

        const subscriptionDocs = await admin.firestore().collection('users').doc(userId).collection('activeTopicSubscriptions').get();
        const batch = admin.firestore().batch();
        subscriptionDocs.docs.forEach((doc: { ref: any; }) => {
            batch.update(doc.ref, { nextDigestAt: nextDigestAt });
        });

        await batch.commit();

        // console.log(`DEBUG: Batch update completed for userId: ${userId}`); // Debug statement

        return null; 
    });
