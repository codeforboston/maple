import {
  Change,
  DocumentSnapshot,
  FirestoreEvent,
  onDocumentWritten
} from "firebase-functions/v2/firestore"
import { db, Timestamp } from "../firebase"

export const populateBallotQuestionNotificationEventsHandler = async (
  event: FirestoreEvent<Change<DocumentSnapshot> | undefined, { id: string }>
) => {
  const snapshot = event.data
  if (!snapshot || !snapshot.after.exists) {
    console.error("New snapshot does not exist")
    return
  }

  const oldData = snapshot.before.data()
  const newData = snapshot.after.data()

  if (oldData?.ballotStatus === newData?.ballotStatus) {
    console.log("ballotStatus unchanged, skipping notification event")
    return
  }

  const { id } = event.params

  const existingSnapshot = await db
    .collection("/notificationEvents")
    .where("type", "==", "ballotQuestion")
    .where("ballotQuestionId", "==", id)
    .get()

  if (!existingSnapshot.empty) {
    console.log("Updating existing ballot question notification event")
    const docId = existingSnapshot.docs[0].id
    await db
      .collection("/notificationEvents")
      .doc(docId)
      .update({
        ballotStatus: newData?.ballotStatus,
        description: newData?.description ?? null,
        updateTime: Timestamp.now()
      })
  } else {
    console.log("Creating new ballot question notification event")
    if (newData) {
      await db.collection("/notificationEvents").add({
        type: "ballotQuestion",
        ballotQuestionId: id,
        ballotQuestionCourt: newData.court,
        ballotStatus: newData.ballotStatus,
        description: newData.description ?? null,
        updateTime: Timestamp.now()
      })
    }
  }
}

export const populateBallotQuestionNotificationEvents = onDocumentWritten(
  "/ballotQuestions/{id}",
  populateBallotQuestionNotificationEventsHandler
)
