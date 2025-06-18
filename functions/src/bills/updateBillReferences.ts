import { difference, flatten, flattenDeep } from "lodash"
import { Hearing } from "../events/types"
import { db, FieldValue } from "../firebase"
import { parseApiDateTime } from "../malegislature"
import { Member, MemberReference } from "../members/types"
import BillProcessor, { BillUpdates } from "./BillProcessor"
import { Timestamp } from "../../../common/types"

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

  async process() {
    this.membersById = new Map(this.members.map(m => [m.id, m] as const))

    const updates = this.mergeUpdates(
      this.getCommitteeUpdates(),
      this.getCityUpdates(),
      await this.getEventUpdates()
    )

    await this.writeBills(updates)
  }

  override get billFields() {
    return ["id"]
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

  async getEventUpdates(): Promise<BillUpdates> {
    const hearings = await db
      .collection(`/events`)
      .where("startsAt", ">=", new Date())
      .where("type", "==", "hearing")
      .get()
      .then(this.load(Hearing))
    const updates: BillUpdates = new Map()

    // Set the next hearing on every bill referenced by upcoming hearings.
    const billEvents = flattenDeep<{
      startsAt: Timestamp
      billId: string
      hearingId: string
      court: number
    }>(
      hearings.map(hearing =>
        hearing.content.HearingAgendas.map(agenda =>
          agenda.DocumentsInAgenda.map(doc => ({
            startsAt: parseApiDateTime(agenda.StartTime),
            billId: doc.BillNumber,
            court: doc.GeneralCourtNumber,
            hearingId: hearing.id
          }))
        )
      )
    )
    billEvents.forEach(event => {
      const existing = updates.get(event.billId)
      if (!existing || event.startsAt < (existing.nextHearingAt as Timestamp)) {
        updates.set(event.billId, {
          nextHearingAt: event.startsAt,
          nextHearingId: event.hearingId
        })
      }
    })

    // Remove the next hearing on any bills that reference upcoming hearings but
    // aren't on the agenda.
    const hearingIds = new Set(billEvents.map(e => e.hearingId)),
      billsWithEvents = billEvents.map(e => e.billId),
      existingBillsWithEvents = this.bills
        .filter(b => hearingIds.has(b.nextHearingId))
        .map(b => b.id as string),
      billsWithRemovedEvents = difference(
        existingBillsWithEvents,
        billsWithEvents
      )
    billsWithRemovedEvents.forEach(id => {
      updates.set(id, {
        nextHearingAt: FieldValue.delete(),
        nextHearingId: FieldValue.delete()
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
        Object.assign(merged.get(billId)!, docUpdate)
      })
    })
    return merged
  }
}

export const updateBillReferences =
  BillProcessor.scheduled(UpdateBillReferences)
