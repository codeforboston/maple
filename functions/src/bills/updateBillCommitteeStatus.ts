import { runWith } from "firebase-functions"
import { difference, flatten } from "lodash"
import { Bill } from "./types"
import { DocUpdate } from "../common"
import { db, FieldValue } from "../firebase"
import * as api from "../malegislature"
import { Committee } from "../committees/types"

/**
 * Updates the current committee of each bill.
 *
 * This does a full read of the bills table and clears the current committee of
 * any bill not listed under `DocumentsBeforeCommittee` for some bill.
 */
export const updateBillCommitteeStatus = runWith({ timeoutSeconds: 120 })
  .pubsub.schedule("every 24 hours")
  .onRun(async () => {
    const billIds = await db
      .collection(billPath())
      .select()
      .get()
      .then(c => c.docs.filter(d => d.exists).map(d => d.id))
    const committees = await db
      .collection(`/generalCourts/${api.currentGeneralCourt}/committees`)
      .get()
      .then(c => c.docs.map(d => d.data()).filter(Committee.guard))
    const billsInCommittee = flatten(
      committees.map(c => c.content.DocumentsBeforeCommittee)
    )
    const billsOutOfCommittee = difference(billIds, billsInCommittee)

    const writer = db.bulkWriter()

    // Set the committee on bills listed in a committee
    committees.forEach(c =>
      c.content.DocumentsBeforeCommittee.forEach(billId => {
        const update: DocUpdate<Bill> = {
          currentCommitte: { id: c.id, name: c.content.FullName }
        }
        writer.set(db.doc(billPath(billId)), update, { merge: true })
      })
    )

    // Clear the committee on bills not in committee
    billsOutOfCommittee.forEach(id => {
      const update: DocUpdate<Bill> = {
        currentCommitte: FieldValue.delete()
      }
      writer.set(db.doc(billPath(id)), update, { merge: true })
    })

    await writer.close()
  })

const billPath = (id?: string) =>
  `/generalCourts/${api.currentGeneralCourt}/bills${id ? `/${id}` : ""}`
