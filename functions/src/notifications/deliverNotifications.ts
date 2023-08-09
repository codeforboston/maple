// Function that finds all notification feed documents that are ready to be digested and emails them to the user.
// Creates an email document in /notifications_mails to queue up the send.
// TODO: Implement email/emailDelivery.ts , use it to take in the template, data and recipient, then generate the HTML and write the document
// See: https://console.firebase.google.com/u/0/project/digital-testimony-dev/extensions/instances/firestore-send-email?tab=usage
// runs at least every 24 hours, but can be more or less frequent, depending on the value stored in the user's userNotificationFeed document, as well as a nextDigestTime value stored in the user's userNotificationFeed document.

// Import necessary Firebase modules and libraries
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as handlebars from 'handlebars';
import * as fs from 'fs';

// Get a reference to the Firestore database
const db = admin.firestore();
const path = require('path');

// Define Handlebars helper functions
handlebars.registerHelper('toLowerCase', function (str: string) {
  if (str && typeof str === 'string') {
    return str.toLowerCase();
  } else {
      return '';
  }
});

handlebars.registerHelper('noUpdatesFormat', function (str: string) {
  let result = ""
  switch (str) {
    case "Monthly":
      result = "this month"
      break
    case "Weekly":
      result = "this week"
      break
    default:
      result = "today"
  }
  return result
});

handlebars.registerHelper('isDefined', function (value: any) {
  return value !== undefined;
});

// Function to register partials for the email template
function registerPartials(directoryPath: string) {
  const filenames = fs.readdirSync(directoryPath);

  filenames.forEach((filename) => {
      const partialPath = path.join(directoryPath, filename);
      const stats = fs.statSync(partialPath);

      if (stats.isDirectory()) {
      // Recursive call for directories
      registerPartials(partialPath);
      } else if (stats.isFile() && path.extname(filename) === '.handlebars') {
      // Register partials for .handlebars files
      const partialName = path.basename(filename, '.handlebars');
      const partialContent = fs.readFileSync(partialPath, 'utf8');
      handlebars.registerPartial(partialName, partialContent);
      }
  });
}

// Define the deliverNotifications function
export const deliverNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // Get the current timestamp
    const now = admin.firestore.Timestamp.now();

    // Query the userNotificationFeed collection group for feeds where nextDigestAt < now
    const feedsSnapshot = await db
      .collectionGroup('userNotificationFeed')
      .where('nextDigestAt', '<', now)
      .get();

    // Iterate through each feed, load up all undelivered notification documents, and process them into a digest
    const emailPromises = feedsSnapshot.docs.map(async (doc) => {
      const feed = doc.data();
      const { userId, notificationFrequency } = feed;

      // Get the undelivered notification documents
      const notificationsSnapshot = await db
        .collection(`users/${userId}/userNotificationFeed`)
        .where('delivered', '==', false)
        .get();

      // Process notifications into a digest type
      const digestData = notificationsSnapshot.docs.map((notificationDoc) => {
        const notification = notificationDoc.data();
        // Process and structure the notification data for display in the email template
        // ...

        return notification;
      });

      // Register partials for the email template
      const partialsDir = path.join(__dirname, '../../functions/src/email/partials');
      registerPartials(partialsDir);
      // Render the email template using the digest data
      const emailTemplate = '../email/digestEmail.handlebars'; 
      const templateSource = fs.readFileSync(emailTemplate, 'utf8');
      const compiledTemplate = handlebars.compile(templateSource);
      const htmlString = compiledTemplate({ digestData });

      // Create an email document in /notifications_mails to queue up the send
      await db.collection('notifications_mails').add({
        to: feed.email,
        message: {
          subject: 'Your Notifications Digest',
          html: htmlString,
        },
        createdAt: admin.firestore.Timestamp.now(),
      });

      // Mark the notifications as delivered
      const updatePromises = notificationsSnapshot.docs.map((notificationDoc) =>
        notificationDoc.ref.update({ delivered: true }),
      );
      await Promise.all(updatePromises);

      // Update nextDigestAt timestamp for the current feed
      // DEBUG: set nextDigestAt as a Date object for testing, 
      // change this line to Timestamp? 
      const nextDigestAt = new Date(now.toMillis() + notificationFrequency * 24 * 60 * 60 * 1000);
      await doc.ref.update({ nextDigestAt });
    });

    // Wait for all email documents to be created
    await Promise.all(emailPromises);
  });
