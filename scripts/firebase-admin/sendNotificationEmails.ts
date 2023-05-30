import { Script } from "./types";
import * as admin from 'firebase-admin';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as readline from 'readline';

admin.initializeApp();

// Connect to Firestore emulator
admin.firestore().settings({
  host: 'localhost:3010', // the port your Firestore emulator is running on
  ssl: false,
});

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
  

/** Function to deliver notifications manually */
async function deliverNotificationsLogic() {
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
    const emailTemplate = path.join(__dirname, '../../functions/src/email/digestEmail.handlebars');
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
}

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

/** Seed Firestore with userNotificationFeed for a specific user and then deliver notifications */
export const script: Script = async ({ db }) => {
    // Ask for user email
    rl.question('Enter the email of the user to test: ', async (userEmail) => {
  
    // Define the user's notifications
    const notifications = [
    {
        header: 'Example Notification 1',
        subheader: 'Example Subheader 1',
        bodyText: 'Example Body Text 1',
        delivered: false,
        createdAt: new Date(),  // Change this line
        type: 'bill',
        court: 'exampleCourt',
    },
    {
        header: 'Example Notification 2',
        subheader: 'Example Subheader 2',
        bodyText: 'Example Body Text 2',
        delivered: false,
        createdAt: new Date(),  // Change this line
        type: 'org',
    },
    ];

    // Define test user
    const testUser = {
        uid: 'testUid', // some unique identifier for this user
        fullName: 'Test User',
        email: userEmail,
        password: 'password',
        public: true,
        role: 'test'
    };

    // Check if a user with the test email already exists
    let userSnapshot = await db.collection('users').where('email', '==', userEmail).get();

    let userDoc;
    if (userSnapshot.empty) {
    // If not, create a new org user with the test email
    console.log(`Creating new test user with email: ${userEmail}`);

    // create auth user
    const newUserAuth = await admin.auth().createUser({
        uid: testUser.uid,
        email: userEmail,
        password: testUser.password
    });

    // set custom user claims
    await admin.auth().setCustomUserClaims(testUser.uid, { role: testUser.role });

    // add user profile to Firestore
    const newUserRef = await db.collection('users').doc(testUser.uid);
    await newUserRef.set(testUser);

    userDoc = await newUserRef.get();
    } else {
    userDoc = userSnapshot.docs[0];
    }

    const userId = userDoc.id;

    // Create notifications in userNotificationFeed
    const userNotificationFeedRef = db.collection(`users/${userId}/userNotificationFeed`);
    notifications.forEach(async (notification) => {
        await userNotificationFeedRef.add(notification);
    });

    // Set nextDigestAt to a timestamp less than the current time
    // DEBUG: set nextDigestAt as a Date object for testing, 
    // change this line to Timestamp?
    const nextDigestAt = new Date(Date.now() - 60 * 1000); // 1 minute in the past

    await userNotificationFeedRef.doc('feedControl').set({
        nextDigestAt,
        notificationFrequency: 1,
        userId,
        email: userEmail,
    });

    console.log(`UserNotificationFeed seeded for user with email: ${userEmail}`);

    // Trigger the deliverNotifications function
    await deliverNotificationsLogic();
    console.log(`Notifications sent to the notifications_mails queue for user with email: ${userEmail}`);

    
    rl.close();
  });
};
