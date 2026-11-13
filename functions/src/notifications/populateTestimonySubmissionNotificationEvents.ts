// Sets up a document trigger for /events and queries the activeTopicSubscriptions collection group in Firestore
// for all subscriptions for the given topic event, then creates a notification document in the user's notification feed.
// This function runs every time a new topic event is created in the /events collection.
// Creates a notification document in the user's notification feed for each active subscription.

// Import necessary Firebase modules
import {
  Change,
  DocumentSnapshot,
  FirestoreEvent,
  onDocumentWritten
} from "firebase-functions/v2/firestore"
import * as logger from "firebase-functions/logger"
import { db, Timestamp } from "../firebase"
import { conferenceName } from "../shared"
import { Testimony } from "../testimony/types"
import { TestimonySubmissionNotification } from "./types"

/** The conference's name for headings, as the site shows it: its short name,
 * falling back to its title. Null when the document is missing, so the
 * notification still goes out. */
const conferenceNameOf = async (court: number, conferenceId: string) => {
  const snap = await db
    .doc(`/generalCourts/${court}/conferences/${conferenceId}`)
    .get()
  const data = snap.data()
  return (data && conferenceName(data)) || null
}

export const populateTestimonySubmissionNotificationEventsHandler = async (
  event: FirestoreEvent<
    Change<DocumentSnapshot> | undefined,
    { userId: string; testimonyId: string }
  >
) => {
  const snapshot = event.data
  if (!snapshot || !snapshot.after.exists) {
    console.error("New snapshot does not exist")
    return
  }

  const documentCreated = !snapshot.before.exists

  const oldData = snapshot.before.data()
  const newData = snapshot.after.data()

  // New testimony added
  if (documentCreated) {
    console.log("New document created")

    // Publishing always writes a whole Testimony, so anything else was
    // written by hand. Without a notification event nobody hears of it, and
    // add() would reject the undefined fields.
    const checked = Testimony.validateWithDefaults(newData)
    if (!checked.success) {
      logger.error(
        `Testimony ${event.params.testimonyId} is not a valid publication, skipping notification event: ${checked.message}`
      )
      return
    }
    const testimony = checked.value

    const bqId = testimony.ballotQuestionId ?? null
    const conferenceId = testimony.conferenceId ?? null

    const newNotificationEvent: TestimonySubmissionNotification = {
      type: "testimony",

      billCourt: testimony.court.toString(),
      billId: testimony.billId,
      billName: testimony.billTitle,

      userId: testimony.authorUid,
      userRole: testimony.authorRole,
      testimonyId: event.params.testimonyId,
      testimonyUser: testimony.fullName,
      testimonyPosition: testimony.position,
      testimonyContent: testimony.content,
      testimonyVersion: testimony.version,

      ballotQuestionId: bqId,
      ballotQuestionCourt: bqId ? testimony.court : null,
      conferenceId,
      conferenceName: conferenceId
        ? await conferenceNameOf(testimony.court, conferenceId)
        : null,

      updateTime: Timestamp.now()
    }

    await db.collection("/notificationEvents").add(newNotificationEvent)

    return
  }

  const oldVersion = oldData?.version
  const newVersion = newData?.version

  console.log(`oldVersion: ${oldVersion}, newVersion: ${newVersion}`)
  if (oldVersion === newVersion) return

  const notificationEventSnapshot = await db
    .collection("/notificationEvents")
    .where("type", "==", "org")
    .where("billCourt", "==", newData?.court.toString())
    .where("billId", "==", newData?.billId)
    .where("authorUid", "==", newData?.authorUid)
    .get()

  console.log(
    `${notificationEventSnapshot.docs} ${notificationEventSnapshot.docs.length}`
  )

  if (!notificationEventSnapshot.empty) {
    const notificationEventId = notificationEventSnapshot.docs[0].id

    // Update the existing notification event
    await db.collection("/notificationEvents").doc(notificationEventId).update({
      testimonyPosition: newData?.position,
      testimonyContent: newData?.content,
      testimonyVersion: newData?.version,
      updateTime: Timestamp.now()
    })
  }
}

export const populateTestimonySubmissionNotificationEvents = onDocumentWritten(
  "/users/{userId}/publishedTestimony/{testimonyId}",
  populateTestimonySubmissionNotificationEventsHandler
)
