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
import { db, Timestamp } from "../firebase"
import { TestimonySubmissionNotification } from "./types"

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

    const bqId: string | null = newData?.ballotQuestionId ?? null
    const bqCourt: number | null = bqId
      ? (newData?.court as number) ?? null
      : null

    const newNotificationEvent: TestimonySubmissionNotification = {
      type: "testimony",

      billCourt: newData?.court?.toString(),
      billId: newData?.billId,
      billName: newData?.billTitle,

      userId: newData?.authorUid,
      userRole: newData?.authorRole,
      testimonyId: event.params.testimonyId,
      testimonyUser: newData?.fullName,
      testimonyPosition: newData?.position,
      testimonyContent: newData?.content,
      testimonyVersion: newData?.version,

      ballotQuestionId: bqId,
      ballotQuestionCourt: bqCourt,
      conferenceId: newData?.conferenceId ?? null,

      updateTime: Timestamp.now()
    }

    // A publication missing what a notification needs (older documents,
    // test fixtures) would make add() reject undefined fields.
    const missing = Object.entries(newNotificationEvent)
      .filter(([, value]) => value === undefined)
      .map(([key]) => key)
    if (missing.length > 0) {
      console.warn(
        `Testimony ${event.params.testimonyId} lacks ${missing.join(
          ", "
        )}, skipping notification event`
      )
      return
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
