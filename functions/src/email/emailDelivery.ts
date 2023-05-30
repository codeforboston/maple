import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

// Initialize the Firebase admin SDK
admin.initializeApp();

sgMail.setApiKey('SENDGRID_API_KEY');

// Listen for new messages added to notifications_mails collection
exports.sendEmails = functions.firestore
  .document('notifications_mails/{mailId}')
  .onCreate(async (snap, context) => {
    const mail = snap.data();

    if (mail) {
      const msg = {
        to: mail.to,
        from: 'no-reply@your-app.com', // TODO: Use the email address or domain verified with SendGrid
        subject: mail.message.subject,
        html: mail.message.html,
      };

      // Send the email
      try {
        await sgMail.send(msg);
        console.log(`Email sent to ${mail.to}`);
      } catch (error) {
        console.error('There was an error while sending the email:', error);
      }
    }
  });
