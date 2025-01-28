import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import * as handlebars from "handlebars"
import * as helpers from "../email/helpers"
import * as fs from "fs"
import { Timestamp } from "../firebase"
import { getNextDigestAt } from "./helpers"
import { Frequency } from "../auth/types"

// Get a reference to the Firestore database
const db = admin.firestore()
const path = require("path")

// Define Handlebars helper functions
handlebars.registerHelper("toLowerCase", helpers.toLowerCase)
handlebars.registerHelper("noUpdatesFormat", helpers.noUpdatesFormat)
handlebars.registerHelper("isDefined", helpers.isDefined)

// Function to register partials for the email template
function registerPartials(directoryPath: string) {
  const filenames = fs.readdirSync(directoryPath)

  filenames.forEach(filename => {
    const partialPath = path.join(directoryPath, filename)
    const stats = fs.statSync(partialPath)

    if (stats.isDirectory()) {
      // Recursive call for directories
      registerPartials(partialPath)
    } else if (stats.isFile() && path.extname(filename) === ".handlebars") {
      // Register partials for .handlebars files
      const partialName = path.basename(filename, ".handlebars")
      const partialContent = fs.readFileSync(partialPath, "utf8")
      handlebars.registerPartial(partialName, partialContent)
    }
  })
}


const deliverEmailNotifications = async () => {
  // Get the current timestamp
  const now = Timestamp.fromDate(new Date())

  // check if the nextDigestAt is less than the current timestamp, so that we know it's time to send the digest
  // if nextDigestAt does not equal null, then the user has a notification digest scheduled
  const subscriptionSnapshot = await db
    .collectionGroup("activeTopicSubscriptions")
    .where("nextDigestAt", "<", now)
    .get()

  // Iterate through each feed, load up all undelivered notification documents, and process them into a digest
  const emailPromises = subscriptionSnapshot.docs.map(async doc => {
    const subscriptions = doc.data()

    const { uid } = subscriptions

    interface User {
      notificationFrequency: Frequency
      email: string
    }

    // Fetch the user document
    const userDoc = await db.collection("users").doc(uid).get()

    if (!userDoc.exists || !userDoc.data()) {
      console.warn(
        `User document with id ${uid} does not exist or has no data.`
      )
      return // Skip processing for this user
    }

    const userData: User = userDoc.data() as User

    if (!("notificationFrequency" in userData) || !("email" in userData)) {
      console.warn(
        `User document with id ${uid} does not have notificationFrequency and/or email property.`
      )
      return // Skip processing for this user
    }

    const { notificationFrequency, email } = userData

    // Get the undelivered notification documents
    const notificationsSnapshot = await db
      .collection(`users/${uid}/userNotificationFeed`)
      .where("delivered", "==", false)
      .get()

    // Process notifications into a digest type
    const digestData = notificationsSnapshot.docs.map(notificationDoc => {
      const notification = notificationDoc.data()
      // Process and structure the notification data for display in the email template
      // ...

      return notification
    })

    // Register partials for the email template
    const partialsDir = "/app/functions/lib/email/partials/"
    registerPartials(partialsDir)

    console.log("DEBUG: Working directory: ", process.cwd())
    console.log(
      "DEBUG: Digest template path: ",
      path.resolve("/app/functions/lib/email/digestEmail.handlebars")
    )

    // Render the email template using the digest data
    const emailTemplate = "/app/functions/lib/email/digestEmail.handlebars"
    const templateSource = fs.readFileSync(
      path.join(__dirname, emailTemplate),
      "utf8"
    )
    const compiledTemplate = handlebars.compile(templateSource)
    const htmlString = compiledTemplate({ digestData })

    // Create an email document in /notifications_mails to queue up the send
    await db.collection("notifications_mails").add({
      to: [email],
      message: {
        subject: "Your Notifications Digest",
        text: "", // blank because we're sending HTML
        html: htmlString
      },
      createdAt: Timestamp.now()
    })

    // Mark the notifications as delivered
    const updatePromises = notificationsSnapshot.docs.map(notificationDoc =>
      notificationDoc.ref.update({ delivered: true })
    )
    await Promise.all(updatePromises)

    // Update nextDigestAt timestamp for the current feed
    const nextDigestAt = getNextDigestAt(notificationFrequency)
    await doc.ref.update({ nextDigestAt })
  })

  // Wait for all email documents to be created
  await Promise.all(emailPromises)
}

// Define the deliverNotifications function
export const deliverNotifications = functions.pubsub
  .schedule("every 24 hours")
  .onRun(deliverEmailNotifications)

export const httpsDeliverNotifications = functions.https.onRequest(
  async (request, response) => {
    try {
      await deliverEmailNotifications()

      console.log("DEBUG: deliverNotifications completed")

      response.status(200).send("Successfully delivered notifications")
    } catch (error) {
      console.error("Error in deliverNotifications:", error)
      response.status(500).send("Internal server error")
    }
  }
)