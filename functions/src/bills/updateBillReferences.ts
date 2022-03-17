import { runWith } from "firebase-functions"
import { difference, flatten } from "lodash"
import { Bill } from "./types"
import { DocUpdate } from "../common"
import { db, FieldValue } from "../firebase"
import * as api from "../malegislature"
import { Committee } from "../committees/types"
import { City } from "../cities/types"
import { Member, MemberReference } from "../members/types"

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
class UpdateBillReferences {
  private billIds!: string[]
  private committees!: Committee[]
  private members!: Map<string, Member>
  private cities!: City[]

  get function() {
    return runWith({ timeoutSeconds: 120 })
      .pubsub.schedule("every 24 hours")
      .onRun(() => this.run())
  }

  async run() {
    await this.readEntities()

    const updates = mergeUpdates(
      this.getCommitteeUpdates(),
      this.getCityUpdates()
    )

    await this.writeBills(updates)
  }

  private async writeBills(updates: BillUpdates) {
    const writer = db.bulkWriter()
    updates.forEach((update, id) => {
      writer.set(db.doc(billPath(id)), update, { merge: true })
    })
    await writer.close()
  }

  private async readEntities() {
    this.billIds = await db
      .collection(billPath())
      .select()
      .get()
      .then(c => c.docs.filter(d => d.exists).map(d => d.id))

    this.cities = await db
      .collection(`/generalCourts/${api.currentGeneralCourt}/cities`)
      .get()
      .then(c => c.docs.map(d => d.data()).filter(City.guard))

    this.committees = await db
      .collection(`/generalCourts/${api.currentGeneralCourt}/committees`)
      .get()
      .then(c => c.docs.map(d => d.data()).filter(Committee.guard))

    this.members = await db
      .collection(`/generalCourts/${api.currentGeneralCourt}/members`)
      .get()
      .then(c =>
        c.docs
          .map(d => d.data())
          .filter(Member.guard)
          .map(m => [m.id, m] as const)
      )
      .then(entries => new Map(entries))
  }

  getCityUpdates(): BillUpdates {
    const billsWithoutCity = difference(
      this.billIds,
      flatten(this.cities.map(c => c.bills))
    )
    const updates: BillUpdates = new Map()

    // Update the city for each bill listed in a city
    this.cities.forEach(city => {
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

  getCommitteeUpdates(): BillUpdates {
    const billsInCommittee = flatten(
      this.committees.map(c => c.content.DocumentsBeforeCommittee)
    )
    const billsOutOfCommittee = difference(this.billIds, billsInCommittee)
    const updates: BillUpdates = new Map()

    // Set the committee on bills listed in a committee
    this.committees.forEach(c =>
      c.content.DocumentsBeforeCommittee.forEach(billId => {
        updates.set(billId, {
          currentCommittee: {
            id: c.id,
            name: c.content.FullName,
            houseChair: this.formatChair(c.content.HouseChairperson),
            senateChair: this.formatChair(c.content.SenateChairperson)
          }
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

  formatChair(m: MemberReference | null) {
    if (m === null) return null
    const member = this.members.get(m.MemberCode)
    if (!member) return null
    return {
      id: member.id,
      name: member.content.Name,
      email: member.content.EmailAddress
    }
  }
}

export const updateBillReferences = new UpdateBillReferences().function
