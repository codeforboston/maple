import * as functions from "firebase-functions"
import * as handlebars from "handlebars"
import * as fs from "fs"
import { auth, db, Timestamp } from "../firebase"
import {
  convertHtmlToText,
  getNextDigestAt,
  getNotificationStartDate
} from "./helpers"
import { startOfDay } from "date-fns"
import { TestimonySubmissionNotificationFields, Profile } from "./types"
import {
  BallotQuestionDigest,
  BillDigest,
  NotificationEmailDigest,
  Position,
  UserDigest
} from "./emailTypes"
import { prepareHandlebars } from "../email/handlebarsHelpers"
import { Frequency } from "../auth/types"

const PROFILE_BATCH_SIZE = 50
const NUM_BILLS_TO_DISPLAY = 4
const NUM_USERS_TO_DISPLAY = 4
const NUM_TESTIMONIES_TO_DISPLAY = 6
const NUM_BALLOT_QUESTIONS_TO_DISPLAY = 4
const EMAIL_TEMPLATE_PATH = "../email/digestEmail.handlebars"

const path = require("path")

const getVerifiedUserEmail = async (uid: string) => {
  try {
    const userRecord = await auth.getUser(uid)
    if (userRecord && userRecord.email && userRecord.emailVerified) {
      return userRecord.email
    } else {
      return null
    }
  } catch (error) {
    console.error(`Error getting user email for UID ${uid}:`, error)
    return null
  }
}

// TODO: Batching (at both user + email level)?
const deliverEmailNotifications = async () => {
  const now = Timestamp.fromDate(startOfDay(new Date()))

  prepareHandlebars()

  let numProfilesProcessed = 0

  let profilesSnapshot = await db
    .collection("profiles")
    .where("nextDigestAt", "<=", now)
    .limit(PROFILE_BATCH_SIZE)
    .get()

  if (profilesSnapshot.empty) {
    console.log(
      `No profiles found with nextDigestAt <= ${now.toDate()} - sending 0 emails`
    )
    return
  }

  do {
    console.log(
      `Processing batch of ${
        profilesSnapshot.size
      } profiles with nextDigestAt <= ${now.toDate()} starting with ${
        profilesSnapshot.docs[0].id
      }`
    )
    numProfilesProcessed += profilesSnapshot.size

    const emailPromises = profilesSnapshot.docs.map(async profileDoc => {
      const profile = profileDoc.data() as Profile
      if (
        !profile ||
        !profile.notificationFrequency ||
        profile.notificationFrequency === "None"
      ) {
        console.log(
          `User ${profileDoc.id} has no notificationFrequency - skipping`
        )
        return
      }

      const defaultEmail = profile.email || profile.contactInfo?.publicEmail
      const verifiedEmail =
        (await getVerifiedUserEmail(profileDoc.id)) || defaultEmail
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

      if (
        digestData.numBillsWithNewTestimony === 0 &&
        digestData.numUsersWithNewTestimony === 0 &&
        digestData.numBallotQuestionsWithNewTestimony === 0
      ) {
        console.log(
          `No new notifications for ${profileDoc.id} - not sending email`
        )
      } else {
        console.log(
          `Sending email to user ${profileDoc.id} with data: ${digestData}`
        )
        const htmlString = renderToHtmlString(digestData)

        const email = {
          to: [verifiedEmail],
          message: {
            subject: "Your Notifications Digest",
            text: convertHtmlToText(htmlString), // TODO: Just make a text template for this
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

      console.log(
        `Updated nextDigestAt for ${profileDoc.id} to ${nextDigestAt?.toDate()}`
      )
    })

    await Promise.all(emailPromises)

    profilesSnapshot = await db
      .collection("profiles")
      .where("nextDigestAt", "<=", now)
      .startAfter(profilesSnapshot.docs[profilesSnapshot.docs.length - 1])
      .limit(PROFILE_BATCH_SIZE)
      .get()
  } while (!profilesSnapshot.empty)

  console.log(`Finished processing ${numProfilesProcessed} profiles`)
}

export const buildDigestData = async (
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
  const ballotQuestionsById: { [bqId: string]: BallotQuestionDigest } = {}

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

    if (notification.isBallotQuestionMatch && notification.ballotQuestionId) {
      const bqId = notification.ballotQuestionId
      if (ballotQuestionsById[bqId]) {
        const bq = ballotQuestionsById[bqId]
        switch (notification.position) {
          case "endorse":
            bq.endorseCount++
            break
          case "neutral":
            bq.neutralCount++
            break
          case "oppose":
            bq.opposeCount++
            break
          default:
            console.error(`Unknown position: ${notification.position}`)
            break
        }
      } else {
        ballotQuestionsById[bqId] = {
          ballotQuestionId: bqId,
          description: notification.header,
          endorseCount: notification.position === "endorse" ? 1 : 0,
          neutralCount: notification.position === "neutral" ? 1 : 0,
          opposeCount: notification.position === "oppose" ? 1 : 0
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

  const ballotQuestions = Object.values(ballotQuestionsById).sort((a, b) => {
    return (
      b.endorseCount +
      b.neutralCount +
      b.opposeCount -
      (a.endorseCount + a.neutralCount + a.opposeCount)
    )
  })

  return {
    notificationFrequency,
    startDate: startDate.toDate(),
    endDate: now.toDate(),
    bills: bills.slice(0, NUM_BILLS_TO_DISPLAY),
    numBillsWithNewTestimony: bills.length,
    users: users.slice(0, NUM_USERS_TO_DISPLAY),
    numUsersWithNewTestimony: users.length,
    ballotQuestions: ballotQuestions.slice(0, NUM_BALLOT_QUESTIONS_TO_DISPLAY),
    numBallotQuestionsWithNewTestimony: ballotQuestions.length
  }
}

// TODO: Unit tests
const renderToHtmlString = (digestData: NotificationEmailDigest) => {
  // TODO: Can we move the compilation up so we only compile the template once?
  const templateSource = fs.readFileSync(
    path.join(__dirname, EMAIL_TEMPLATE_PATH),
    "utf8"
  )
  const compiledTemplate = handlebars.compile(templateSource)
  return compiledTemplate(digestData)
}

// Firebase Functions
export const deliverNotifications = functions.pubsub
  .schedule("47 9 * * *") // 9:47 AM every day
  .timeZone("America/New_York")
  .onRun(deliverEmailNotifications)
