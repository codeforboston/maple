// Import necessary Firebase modules and libraries
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as handlebars from 'handlebars';
import * as helpers from "../email/helpers"
import * as fs from 'fs';
import { Timestamp } from "../firebase"

// Get a reference to the Firestore database
const db = admin.firestore();
const path = require('path');

// Define Handlebars helper functions
handlebars.registerHelper('toLowerCase', helpers.toLowerCase);

handlebars.registerHelper('noUpdatesFormat', helpers.noUpdatesFormat);

handlebars.registerHelper('isDefined', helpers.isDefined);

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
export const httpsDeliverNotifications = functions.https.onRequest(async (request, response) => {
    try {

      // Get the current timestamp
      const now = Timestamp.fromDate(new Date());

      // check if the nextDigestAt is less than the current timestamp, so that we know it's time to send the digest
      // if nextDigestAt does not equal null, then the user has a notification digest scheduled
      const subscriptionSnapshot = await db
        .collectionGroup('activeTopicSubscriptions')
        .where('nextDigestAt', '<', now)
        .get();
    
    // Iterate through each feed, load up all undelivered notification documents, and process them into a digest
    const emailPromises = subscriptionSnapshot.docs.map(async (doc) => {
      const subscriptions = doc.data();
      
      const { uid } = subscriptions;

      interface User {
        notificationFrequency: string;
        email: string;
      }

      // Fetch the user document
      const userDoc = await db.collection('users').doc(uid).get();

      if (!userDoc.exists || !userDoc.data()) {
        console.warn(`User document with id ${uid} does not exist or has no data.`);
        return; // Skip processing for this user
      }

      const userData: User = userDoc.data() as User;

      if (!('notificationFrequency' in userData) || !('email' in userData)) {
        console.warn(`User document with id ${uid} does not have notificationFrequency and/or email property.`);
        return; // Skip processing for this user
      }

      const { notificationFrequency, email } = userData;

      // Get the undelivered notification documents
      const notificationsSnapshot = await db
        .collection(`users/${uid}/userNotificationFeed`)
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
      const partialsDir = '/app/functions/lib/email/partials/';
      registerPartials(partialsDir);

      console.log("DEBUG: Working directory: ", process.cwd());
      console.log("DEBUG: Digest template path: ", path.resolve('/app/functions/lib/email/digestEmail.handlebars'));

      // Render the email template using the digest data
      const emailTemplate = '/app/functions/lib/email/digestEmail.handlebars'; 
      const templateSource = fs.readFileSync(emailTemplate, 'utf8');
      const compiledTemplate = handlebars.compile(templateSource);
      const htmlString = compiledTemplate({ digestData });

      // Create an email document in /notifications_mails to queue up the send
      await db.collection('notifications_mails').add({
        to: [email],
        message: {
          subject: 'Your Notifications Digest',
          text: 'This is the plaintext section of the email body.',  // You may want to change this to something more meaningful
          html: htmlString,
        },
        createdAt: Timestamp.now(),
      });

      console.log('DEBUG: Email document created in notifications_mails'); // log that the email document has been created


      // Mark the notifications as delivered
      const updatePromises = notificationsSnapshot.docs.map((notificationDoc) =>
        notificationDoc.ref.update({ delivered: true }),
      );
      await Promise.all(updatePromises);

      // Update nextDigestAt timestamp for the current feed
      let nextDigestAt;
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
      
      await doc.ref.update({ nextDigestAt });
      
    });

    await Promise.all(emailPromises);

    console.log('DEBUG: deliverNotifications completed');
    
    response.status(200).send('Successfully delivered notifications');
  } catch (error) {
    console.error('Error in deliverNotifications:', error);
    response.status(500).send('Internal server error');
  }
    
});
