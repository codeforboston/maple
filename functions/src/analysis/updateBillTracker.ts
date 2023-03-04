import { runWith } from "firebase-functions"
import { isEqual } from "lodash"
import { Bill } from "../bills/types"
import { db, Timestamp } from "../firebase"
import { predictBillStatus } from "./predictBillStatus"
import { BillTracker } from "./types"

const currentTrackerVersion = 1
export const billTrackerPath = (billId: string, court: number) =>
  `/billTracker/${court}-${billId}`

export const updateBillTracker = runWith({
  timeoutSeconds: 10
})
  .firestore.document("/generalCourts/{court}/bills/{billId}")
  .onWrite(async (change, context) => {
    const params = context.params,
      billId = String(params.billId),
      court = Number(params.court)
    const previousBill = change.before.exists
      ? Bill.checkWithDefaults(change.before.data())
      : undefined
    const newBill = change.after.exists
      ? Bill.checkWithDefaults(change.after.data())
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
  })

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
