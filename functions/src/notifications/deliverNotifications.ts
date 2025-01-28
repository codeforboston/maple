import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import * as handlebars from "handlebars"
import * as helpers from "../email/helpers"
import * as fs from "fs"
import { Timestamp } from "../firebase"
import { getNextDigestAt, getNotificationStartDate } from "./helpers"
import { startOfDay } from "date-fns"
import { User } from "./types"

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

const PARTIALS_DIR = "/app/functions/lib/email/partials/"
const EMAIL_TEMPLATE_PATH = "/app/functions/lib/email/digestEmail.handlebars"

// TODO: Batching (at both user + email level)?
//       Going to wait until we have a better idea of the performance impact
// TODO: Break up into smaller functions (getDigestData, buildMessage, sendEmail)
const deliverEmailNotifications = async () => {
  const now = Timestamp.fromDate(startOfDay(new Date()))

  const usersSnapshot = await db
    .collection("users")
    .where("nextDigestAt", "<=", now)
    .get()

  const emailPromises = usersSnapshot.docs.map(async userDoc => {
    const user = userDoc.data() as User
    const startDate = getNotificationStartDate(user.notificationFrequency, now)

    const notificationsSnapshot = await db
      .collection(`users/${userDoc.id}/userNotificationFeed`)
      .where("notification.timestamp", ">=", startDate)
      .where("notification.timestamp", "<", now)
      .get()

    // Process notifications into a digest type
    const digestData = notificationsSnapshot.docs.map(notificationDoc => {
      const notification = notificationDoc.data() as Notification

      // TODO: Process and structure the notification data for display in the email template
      return notification
    })

    // TODO: Can we register these earlier since they're shared across all notifs - maybe at startup?
    registerPartials(PARTIALS_DIR)

    console.log("DEBUG: Working directory: ", process.cwd())
    console.log(
      "DEBUG: Digest template path: ",
      path.resolve("/app/functions/lib/email/digestEmail.handlebars")
    )

    const templateSource = fs.readFileSync(
      path.join(__dirname, EMAIL_TEMPLATE_PATH),
      "utf8"
    )
    const compiledTemplate = handlebars.compile(templateSource)
    const htmlString = compiledTemplate({ digestData })

    // Create an email document in /notifications_mails to queue up the send
    await db.collection("notifications_mails").add({
      to: [user.email],
      message: {
        subject: "Your Notifications Digest",
        text: "", // blank because we're sending HTML
        html: htmlString
      },
      createdAt: Timestamp.now()
    })

    const nextDigestAt = getNextDigestAt(user.notificationFrequency)
    await userDoc.ref.update({ nextDigestAt })
  })

  // Wait for all email documents to be created
  await Promise.all(emailPromises)
}

// Firebase Functions
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
