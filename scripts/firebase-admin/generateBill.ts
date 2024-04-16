// import { Timestamp } from "firebase/firestore"
import { Timestamp } from "../../functions/src/firebase"
import { Record, String, Number } from "runtypes"
import { Script } from "./types"
import { Bill, BillContent } from "../../functions/src/bills/types"

const Args = Record({ 
  court: Number, 
  bills: String 
})

export const script: Script = async ({ db, args }) => {
  const a = Args.check(args)
  const bills = a.bills.split(" ")
  const court = a.court
  const BATCH_SIZE = 500; // Firestore's limit, adjust based on your needs
  let batch = db.batch();
  let opsCounter = 0;

  for (const id of bills) {
    const newBillContent: BillContent = {
      Pinslip: "",
      Title: "",
      PrimarySponsor: null,
      DocumentText: "",
      Cosponsors: []
    }

    const newBill: Bill = {
      id: id,
      court: court,
      content: newBillContent,
      cosponsorCount: 0,
      testimonyCount: 0,
      endorseCount: 0,
      opposeCount: 0,
      neutralCount: 0,
      fetchedAt: Timestamp.now(),
      history: [],
      similar: [],
    }

    const billRef = db.collection(`/generalCourts/${court}/bills`).doc(`${id}`);
    batch.set(billRef, newBill);
    opsCounter++;

    // If we've reached our batch size limit or the end of our bills array, commit the batch.
    if (opsCounter === BATCH_SIZE || id === bills[bills.length - 1]) {
      await batch.commit();
      console.log(`Batch of ${opsCounter} bills added.`);
      batch = db.batch(); // Reset batch
      opsCounter = 0; // Reset operations counter
    }
  }
}
