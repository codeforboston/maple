import { runWith } from "firebase-functions"
import { difference, flatten } from "lodash"
import { Bill } from "./types"
import { DocUpdate } from "../common"
import { db, FieldValue } from "../firebase"
import * as api from "../malegislature"
import { Committee } from "../committees/types"
import { City } from "../cities/types"

type BillUpdates = Map<string, DocUpdate<Bill>>

function mergeUpdates(...updates: BillUpdates[]): BillUpdates {
  const merged: BillUpdates = new Map()
  updates.forEach(update => {
    update.forEach((docUpdate, billId) => {
      if (!merged.has(billId)) merged.set(billId, {})
      Object.assign(merged.get(billId), docUpdate)
    })
  })
  return merged
}

const billPath = (id?: string) =>
  `/generalCourts/${api.currentGeneralCourt}/bills${id ? `/${id}` : ""}`

/**
 * Updates references to other entities for each bill.
 *
 * Bills may have 1-1, many-1, or many-many relationships with other entities.
 * The MA Legislature API only returns one direction for some of these entities.
 * This updates the references on the bill for such entities.
 *
 * This does a full read of the bills table and all entities for which we're
 * updating the relationship. Since there are a lot more bill documents than
 * other entities, we consolidate the updates across all entities into one read
 * and one write per bill, to minimize database access.
 */
export const updateBillReferences = runWith({ timeoutSeconds: 120 })
  .pubsub.schedule("every 24 hours")
  .onRun(async () => {
    const billIds = await db
      .collection(billPath())
      .select()
      .get()
      .then(c => c.docs.filter(d => d.exists).map(d => d.id))

    const updates = mergeUpdates(
      await getCommitteeUpdates(billIds),
      await getCityUpdates(billIds)
    )

    const writer = db.bulkWriter()
    updates.forEach((update, id) => {
      writer.set(db.doc(billPath(id)), update, { merge: true })
    })
    await writer.close()
  })

async function getCityUpdates(billIds: string[]): Promise<BillUpdates> {
  const cities = await db
    .collection(`/generalCourts/${api.currentGeneralCourt}/cities`)
    .get()
    .then(c => c.docs.map(d => d.data()).filter(City.guard))
  const billsWithoutCity = difference(
    billIds,
    flatten(cities.map(c => c.bills))
  )
  const updates: BillUpdates = new Map()

  // Update the city for each bill listed in a city
  cities.forEach(city => {
    city.bills.forEach(id => {
      updates.set(id, { city: city.id })
    })
  })

  // Remove the city for bills without a matching city
  billsWithoutCity.forEach(id => {
    updates.set(id, { city: FieldValue.delete() })
  })

  return updates
}

async function getCommitteeUpdates(billIds: string[]): Promise<BillUpdates> {
  const committees = await db
    .collection(`/generalCourts/${api.currentGeneralCourt}/committees`)
    .get()
    .then(c => c.docs.map(d => d.data()).filter(Committee.guard))
  const billsInCommittee = flatten(
    committees.map(c => c.content.DocumentsBeforeCommittee)
  )
  const billsOutOfCommittee = difference(billIds, billsInCommittee)
  const updates: BillUpdates = new Map()

  // Set the committee on bills listed in a committee
  committees.forEach(c =>
    c.content.DocumentsBeforeCommittee.forEach(billId => {
      updates.set(billId, {
        currentCommittee: { id: c.id, name: c.content.FullName }
      })
    })
  )

  // Clear the committee on bills not in committee
  billsOutOfCommittee.forEach(id => {
    updates.set(id, {
      currentCommittee: FieldValue.delete()
    })
  })

  return updates
}
