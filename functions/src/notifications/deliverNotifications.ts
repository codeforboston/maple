import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import * as handlebars from "handlebars"
import * as fs from "fs"
import { Timestamp } from "../firebase"
import { getNextDigestAt, getNotificationStartDate } from "./helpers"
import { startOfDay } from "date-fns"
import { TestimonySubmissionNotificationFields, Profile } from "./types"
import {
  BillDigest,
  NotificationEmailDigest,
  Position,
  UserDigest
} from "./emailTypes"
import { prepareHandlebars } from "../email/handlebarsHelpers"
import { getAuth } from "firebase-admin/auth"
import { Frequency } from "../auth/types"

const NUM_BILLS_TO_DISPLAY = 4
const NUM_USERS_TO_DISPLAY = 4
const NUM_TESTIMONIES_TO_DISPLAY = 6
const EMAIL_TEMPLATE_PATH = "../email/digestEmail.handlebars"

// Get a reference to the Firestore database
const db = admin.firestore()
const auth = getAuth()
const path = require("path")

const getVerifiedUserEmail = async (uid: string) => {
  const userRecord = await auth.getUser(uid)
  if (userRecord && userRecord.email && userRecord.emailVerified) {
    return userRecord.email
  } else {
    return null
  }
}

// TODO: Batching (at both user + email level)?
//       Going to wait until we have a better idea of the performance impact
const deliverEmailNotifications = async () => {
  const now = Timestamp.fromDate(startOfDay(new Date()))

  console.log("Preparing handlebars helpers and partials")
  prepareHandlebars()
  console.log("Handlebars helpers and partials prepared")

  const profilesSnapshot = await db
    .collection("profiles")
    .where("nextDigestAt", "<=", now)
    .get()

  const emailPromises = profilesSnapshot.docs.map(async profileDoc => {
    const profile = profileDoc.data() as Profile
    if (!profile || !profile.notificationFrequency) {
      console.log(
        `User ${profileDoc.id} has no notificationFrequency - skipping`
      )
      return
    }

    const verifiedEmail = await getVerifiedUserEmail(profileDoc.id)
    if (!verifiedEmail) {
      console.log(
        `Skipping user ${profileDoc.id} because they have no verified email address`
      )
      return
    }

    const digestData = await buildDigestData(
      profileDoc.id,
      now,
      profile.notificationFrequency
    )

    const batch = db.batch()

    // If there are no new notifications, don't send an email
    if (
      digestData.numBillsWithNewTestimony === 0 &&
      digestData.numUsersWithNewTestimony === 0
    ) {
      console.log(
        `No new notifications for ${profileDoc.id} - not sending email`
      )
    } else {
      const htmlString = renderToHtmlString(digestData)

      const email = {
        to: [verifiedEmail],
        message: {
          subject: "Your Notifications Digest",
          text: "", // blank because we're sending HTML
          html: htmlString
        },
        createdAt: Timestamp.now()
      }
      batch.create(db.collection("emails").doc(), email)

      console.log(`Saving email message to user ${profileDoc.id}`)
    }

    const nextDigestAt = getNextDigestAt(profile.notificationFrequency)
    batch.update(profileDoc.ref, { nextDigestAt })
    await batch.commit()

    console.log(`Updated nextDigestAt for ${profileDoc.id} to ${nextDigestAt}`)
  })

  // Wait for all email documents to be created
  await Promise.all(emailPromises)
}
type ProfileData = {
  email: string
  fullName: string
  role: string
}

export const deliverOrgUpgradeStatus = functions.firestore
  .document("profiles/{userId}")
  .onWrite(async (snapshot, context) => {
    const before = snapshot.before.data() as ProfileData
    const after = snapshot.after.data() as ProfileData

    if (before.role === "rolePending") {
      await db.collection("emails").add({
        to: [
          "aerhartic@gmail.com",
          "mvictor@mapletestimony.org",
          "nsanders@mapletestimony.org"
        ],
        subject: `Organization ${
          after.role === "organization" ? "Approved" : "Denied"
        }`,
        text:
          after.role === "organization"
            ? "Your organization's profile has been approved on MAPLE. Thank you for signing up! You can now post testimony for your community to see!"
            : "Unfortunately, your request for an organization profile on MAPLE was denied. We apologize for any confusion. Please email admin@mapletestimony.org for further discussion.",
        html:
          after.role === "organization"
            ? "Your organization's profile has been approved on MAPLE. Thank you for signing up! You can now post testimony for your community to see!"
            : "Unfortunately, your request for an organization profile on MAPLE was denied. We apologize for any confusion. Please email admin@mapletestimony.org for further discussion.",
        createdAt: Timestamp.now()
      })
      if (!snapshot.after.exists) {
        console.error("New snapshot does not exist")
        return
      }
    }
  })

export const adminNotification = functions.firestore
  .document("profiles/{userId}")
  .onCreate(async (snapshot, context) => {
    const organization = snapshot.data() as ProfileData

    await db.collection("emails").add({
      to: [
        "aerhartic@gmail.com",
        "mvictor@mapletestimony.org",
        "nsanders@mapletestimony.org"
      ],
      message: {
        subject: `${organization.fullName} requests approval as an Organization`,
        text: `${organization.fullName} has signed up and now requests approval. Please decide whether to accept or reject their request. Along with responding via the Admin page, you can also contact them at ${organization.email}`,
        html: `${organization.fullName} has signed up and now requests approval. Please decide whether to accept or reject their request. Along with responding via the Admin page, you can also contact them at ${organization.email}`
      },
      createdAt: Timestamp.now()
    })
    // }
    if (!snapshot.exists) {
      console.error("New snapshot does not exist")
      return
    }
  })
export const adminTestimonyNotification = functions.firestore
  .document("reports/{reportId}")
  .onCreate(async (snapshot, context) => {
    type Report = {
      reportId?: string
      testimonyId?: string
    }
    const testimony = snapshot.data() as Report
    await db.collection("emails").add({
      to: [
        "aerhartic@gmail.com",
        "mvictor@mapletestimony.org",
        "nsanders@mapletestimony.org"
      ],
      message: {
        subject: `The testimony report ${testimony.reportId} requests approval`,
        text: `The testimony ${testimony.testimonyId} has been reported and requires approval; please respond accordingly for report ${testimony.reportId}.`,
        html: `The testimony ${testimony.testimonyId} has been reported and requires approval; please respond accordingly for report ${testimony.reportId}.`
      },
      createdAt: Timestamp.now()
    })
    if (!snapshot.exists) {
      console.error("New snapshot does not exist")
      return
    }
  })

// TODO: Unit tests
const buildDigestData = async (
  userId: string,
  now: Timestamp,
  notificationFrequency: Frequency
) => {
  const startDate = getNotificationStartDate(notificationFrequency, now)

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
    notificationFrequency,
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
  const templateSource = fs.readFileSync(
    path.join(__dirname, EMAIL_TEMPLATE_PATH),
    "utf8"
  )
  const compiledTemplate = handlebars.compile(templateSource)
  return compiledTemplate({ digestData })
}

// Firebase Functions
export const deliverNotifications = functions.pubsub
  .schedule("47 9 1 * 2") // 9:47 AM on the first day of the month and on Tuesdays
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

export const httpsDeliverOrgUpgradeStatus = functions.https.onRequest(
  async (request, response) => {
    try {
      deliverOrgUpgradeStatus

      console.log("DEBUG: deliverOrgUpgradeStatus completed")

      response.status(200).send("Successfully deliverOrgUpgradeStatus")
    } catch (error) {
      console.error("Error in deliverOrgUpgradeStatus:", error)
      response.status(500).send("Internal server error")
    }
  }
)

export const httpsDeliverAdminNotifications = functions.https.onRequest(
  async (request, response) => {
    try {
      adminNotification

      console.log("DEBUG: deliverAdminNotifications completed")

      response.status(200).send("Successfully delivered admin notifications")
    } catch (error) {
      console.error("Error in deliverNotifications:", error)
      response.status(500).send("Internal server error")
    }
  }
)

export const httpsDeliverAdminTestinomyNotifications =
  functions.https.onRequest(async (request, response) => {
    try {
      adminTestimonyNotification

      console.log("DEBUG: deliverNotifications completed")

      response.status(200).send("Successfully delivered notifications")
    } catch (error) {
      console.error("Error in deliverNotifications:", error)
      response.status(500).send("Internal server error")
    }
  })
