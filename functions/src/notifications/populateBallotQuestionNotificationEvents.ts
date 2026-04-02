import * as functions from "firebase-functions"
import { db, Timestamp } from "../firebase"

export const populateBallotQuestionNotificationEventsHandler = async (
  snapshot: functions.Change<functions.firestore.DocumentSnapshot>,
  context: functions.EventContext
) => {
  if (!snapshot.after.exists) {
    console.error("New snapshot does not exist")
    return
  }

  const oldData = snapshot.before.data()
  const newData = snapshot.after.data()

  if (oldData?.ballotStatus === newData?.ballotStatus) {
    console.log("ballotStatus unchanged, skipping notification event")
    return
  }

  const { id } = context.params

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

export const populateBallotQuestionNotificationEvents = functions.firestore
  .document("/ballotQuestions/{id}")
  .onWrite(populateBallotQuestionNotificationEventsHandler)
