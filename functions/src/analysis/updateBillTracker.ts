import { onDocumentWritten } from "firebase-functions/v2/firestore"

import { isEqual } from "lodash"
import { Bill } from "../bills/types"
import { db, Timestamp } from "../firebase"
import { predictBillStatus } from "./predictBillStatus"
import { BillTracker } from "./types"

const currentTrackerVersion = 1
export const billTrackerPath = (billId: string, court: number) =>
  `/billTracker/${court}-${billId}`

// export const updateBillTracker = runWith({
export const updateBillTracker = onDocumentWritten(
  "/generalCourts/{court}/bills/{billId}",
  async event => {
    const params = event.params,
      billId = String(params.billId),
      court = Number(params.court)
    const previousBill = event.data?.before.exists
      ? Bill.checkWithDefaults(event.data.before.data())
      : undefined
    const newBill = event.data?.after.exists
      ? Bill.checkWithDefaults(event.data.after.data())
      : undefined

    if (await shouldUpdateBillTracker(newBill, previousBill)) {
      const tracker: BillTracker = {
        id: billId,
        court: court,
        prediction: {
          version: currentTrackerVersion,
          status: predictBillStatus(newBill!.history),
          createdAt: Timestamp.now()
        }
      }
      await db.doc(billTrackerPath(billId, court)).set(tracker, { merge: true })
    }
  }
)

async function shouldUpdateBillTracker(
  newBill: Bill | undefined,
  previousBill: Bill | undefined
) {
  // Leave the tracker if the bill was deleted
  if (!newBill) return false

  const historyChanged = !isEqual(previousBill?.history, newBill.history)

  // Update if history changes
  if (historyChanged) return true

  const snap = await db.doc(billTrackerPath(newBill.id, newBill.court)).get()

  // Create if new bill
  if (!snap.exists) return true

  const tracker = snap.data() as BillTracker

  // Only update if prediction logic changes
  return tracker.prediction?.version !== currentTrackerVersion
}
