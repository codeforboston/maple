import { Timestamp } from "functions/src/firebase";
import { Script } from "./types";
import { Notification } from "functions/src/notifications/populateNotificationEvents";
import { Record, Number } from "runtypes";

const Args = Record({
  court: Number
});

export const script: Script = async ({ db, args }) => {
  console.log(args)

  const a = Args.check(args);
  const court = a.court.toString();

  const snapshot = await db.collection(`/generalCourts/${court}/bills`).get();

  const batchLimit = 500;
  let batch = db.batch();
  let operationCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    if (data) {
      const notificationEvent: Notification = {
        type: "bill",
        court: court,
        id: data.id,
        name: data.id,
        history: data.history,
        historyUpdateTime: Timestamp.now(),
      };

      const ref = db.collection("/notificationEvents").doc();
      batch.set(ref, notificationEvent);
      operationCount++;

      if (operationCount === batchLimit) {
        await batch.commit();
        batch = db.batch();
        operationCount = 0;
      }
    }
  }

  if (operationCount > 0) {
    await batch.commit();
  }
};
