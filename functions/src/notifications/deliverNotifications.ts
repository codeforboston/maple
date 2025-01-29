import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import * as handlebars from "handlebars"
import * as helpers from "../email/helpers"
import * as fs from "fs"
import { Timestamp } from "../firebase"
import { getNextDigestAt, getNotificationStartDate } from "./helpers"
import { startOfDay } from "date-fns"
import { TestimonySubmissionNotificationFields, User } from "./types"
import {
  BillDigest,
  NotificationEmailDigest,
  Position,
  UserDigest
} from "../email/types"

// Get a reference to the Firestore database
const db = admin.firestore()
const path = require("path")

// Define Handlebars helper functions
handlebars.registerHelper("toLowerCase", helpers.toLowerCase)
handlebars.registerHelper("noUpdatesFormat", helpers.noUpdatesFormat)
handlebars.registerHelper("isDefined", helpers.isDefined)
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
const NUM_BILLS_TO_DISPLAY = 4
const NUM_USERS_TO_DISPLAY = 4
const NUM_TESTIMONIES_TO_DISPLAY = 6

const PARTIALS_DIR = "/app/functions/lib/email/partials/"
const EMAIL_TEMPLATE_PATH = "/app/functions/lib/email/digestEmail.handlebars"

// TODO: Batching (at both user + email level)?
//       Going to wait until we have a better idea of the performance impact
const deliverEmailNotifications = async () => {
  const now = Timestamp.fromDate(startOfDay(new Date()))

  const usersSnapshot = await db
    .collection("users")
    .where("nextDigestAt", "<=", now)
    .get()

  const emailPromises = usersSnapshot.docs.map(async userDoc => {
    const user = userDoc.data() as User
    const digestData = await buildDigestData(user, userDoc.id, now)

    // If there are no new notifications, don't send an email
    if (
      digestData.numBillsWithNewTestimony === 0 &&
      digestData.numUsersWithNewTestimony === 0
    ) {
      console.log(`No new notifications for ${userDoc.id} - not sending email`)
    } else {
      const htmlString = renderToHtmlString(digestData)

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

      console.log(`Saved email message to user ${userDoc.id}`)
    }

    const nextDigestAt = getNextDigestAt(user.notificationFrequency)
    await userDoc.ref.update({ nextDigestAt })

    console.log(`Updated nextDigestAt for ${userDoc.id} to ${nextDigestAt}`)
  })

  // Wait for all email documents to be created
  await Promise.all(emailPromises)
}

// TODO: Unit tests
const buildDigestData = async (user: User, userId: string, now: Timestamp) => {
  const startDate = getNotificationStartDate(user.notificationFrequency, now)

  const notificationsSnapshot = await db
    .collection(`users/${userId}/userNotificationFeed`)
    .where("notification.type", "==", "testimony") // Email digest only cares about testimony
    .where("notification.timestamp", ">=", startDate)
    .where("notification.timestamp", "<", now)
    .get()

  const billsById: { [billId: string]: BillDigest } = {}
  const usersById: { [userId: string]: UserDigest } = {}

  notificationsSnapshot.docs.forEach(notificationDoc => {
    const { notification } =
      notificationDoc.data() as TestimonySubmissionNotificationFields

    if (notification.isBillMatch) {
      if (billsById[notification.billId]) {
        const bill = billsById[notification.billId]

        switch (notification.position) {
          case "endorse":
            bill.endorseCount++
            break
          case "neutral":
            bill.neutralCount++
            break
          case "oppose":
            bill.opposeCount++
            break
          default:
            console.error(`Unknown position: ${notification.position}`)
            break
        }
      } else {
        billsById[notification.billId] = {
          billId: notification.billId,
          billName: notification.header,
          billCourt: notification.court,
          endorseCount: notification.position === "endorse" ? 1 : 0,
          neutralCount: notification.position === "neutral" ? 1 : 0,
          opposeCount: notification.position === "oppose" ? 1 : 0
        }
      }
    }

    if (notification.isUserMatch) {
      const billResult = {
        billId: notification.billId,
        court: notification.court,
        position: notification.position as Position
      }
      if (usersById[notification.authorUid]) {
        const user = usersById[notification.authorUid]
        user.bills.push(billResult)
        user.newTestimonyCount++
      } else {
        usersById[notification.authorUid] = {
          userId: notification.authorUid,
          userName: notification.subheader,
          bills: [billResult],
          newTestimonyCount: 1
        }
      }
    }
  })

  const bills = Object.values(billsById).sort((a, b) => {
    return (
      b.endorseCount +
      b.neutralCount +
      b.opposeCount -
      (a.endorseCount + a.neutralCount + a.opposeCount)
    )
  })

  const users = Object.values(usersById)
    .map(userDigest => {
      return {
        ...userDigest,
        bills: userDigest.bills.slice(0, NUM_TESTIMONIES_TO_DISPLAY)
      }
    })
    .sort((a, b) => b.newTestimonyCount - a.newTestimonyCount)

  const digestData = {
    notificationFrequency: user.notificationFrequency,
    startDate: startDate.toDate(),
    endDate: now.toDate(),
    bills: bills.slice(0, NUM_BILLS_TO_DISPLAY),
    numBillsWithNewTestimony: bills.length,
    users: users.slice(0, NUM_USERS_TO_DISPLAY),
    numUsersWithNewTestimony: users.length
  }

  return digestData
}

const renderToHtmlString = (digestData: NotificationEmailDigest) => {
  // TODO: Can we register these earlier since they're shared across all notifs - maybe at startup?
  registerPartials(PARTIALS_DIR)

  console.log("DEBUG: Working directory: ", process.cwd())
  console.log(
    "DEBUG: Digest template path: ",
    path.resolve(EMAIL_TEMPLATE_PATH)
  )

  const templateSource = fs.readFileSync(
    path.join(__dirname, EMAIL_TEMPLATE_PATH),
    "utf8"
  )
  const compiledTemplate = handlebars.compile(templateSource)
  return compiledTemplate({ digestData })
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
