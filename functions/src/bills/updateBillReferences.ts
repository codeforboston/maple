import { difference, flatten } from "lodash"
import { DocUpdate } from "../common"
import { db, FieldValue } from "../firebase"
import { Member, MemberReference } from "../members/types"
import BillProcessor from "./BillProcessor"
import { Bill } from "./types"

type BillUpdates = Map<string, DocUpdate<Bill>>

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
class UpdateBillReferences extends BillProcessor {
  private membersById!: Map<string, Member>
  private billIds!: string[]

  async process() {
    this.membersById = new Map(this.members.map(m => [m.id, m] as const))
    this.billIds = this.bills.map(b => b.id)

    const updates = this.mergeUpdates(
      this.getCommitteeUpdates(),
      this.getCityUpdates()
    )

    await this.writeBills(updates)
  }

  private async writeBills(updates: BillUpdates) {
    const writer = db.bulkWriter()
    updates.forEach((update, id) => {
      writer.set(db.doc(this.billPath(id)), update, { merge: true })
    })
    await writer.close()
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
    const member = this.membersById.get(m.MemberCode)
    if (!member) return null
    return {
      id: member.id,
      name: member.content.Name,
      email: member.content.EmailAddress
    }
  }

  private mergeUpdates(...updates: BillUpdates[]): BillUpdates {
    const merged: BillUpdates = new Map()
    updates.forEach(update => {
      update.forEach((docUpdate, billId) => {
        if (!merged.has(billId)) merged.set(billId, {})
        Object.assign(merged.get(billId), docUpdate)
      })
    })
    return merged
  }
}

export const updateBillReferences = BillProcessor.for(UpdateBillReferences)
