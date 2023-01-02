import { runWith } from "firebase-functions"
import { isEqual } from "lodash"
import { Bill } from "../bills/types"
import { db } from "../firebase"
import { calculateBillStatus } from "./calculateBillTracker"
import { BillTracker } from "./types"

const currentTrackerVersion = 1
const billTrackerPath = (billId: string, court: number) =>
  `/billTracker/${court}-${billId}`

export const updateBillTracker = runWith({
  timeoutSeconds: 10
})
  .firestore.document("/generalCourts/{court}/bills/{billId}")
  .onWrite(async (change, context) => {
    const { billId, court } = context.params
    const previousBill = change.before.exists
      ? Bill.checkWithDefaults(change.before.data())
      : undefined
    const newBill = change.before.exists
      ? Bill.checkWithDefaults(change.after.data())
      : undefined

    if (await shouldUpdateBillTracker(court, newBill, previousBill)) {
      const tracker: BillTracker = {
        id: billId,
        court: court,
        version: currentTrackerVersion,
        status: calculateBillStatus(newBill!.history, previousBill?.history)
      }
      await db.doc(billTrackerPath(billId, court)).set(tracker)
    }
  })

async function shouldUpdateBillTracker(
  // TODO: use court from bill document once included.
  court: number,
  newBill: Bill | undefined,
  previousBill: Bill | undefined
) {
  if (!newBill) return false

  const historyChanged = !isEqual(previousBill?.history, newBill.history)

  if (historyChanged) return true

  const snap = await db.doc(billTrackerPath(newBill.id, court)).get()

  if (!snap.exists) return true

  const tracker = snap.data() as BillTracker

  return tracker.version !== currentTrackerVersion
}
