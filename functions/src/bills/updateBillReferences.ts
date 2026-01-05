import { difference, flatten } from "lodash"
import { Hearing } from "../events/types"
import { db, FieldValue, Timestamp } from "../firebase"
import { Member, MemberReference } from "../members/types"
import BillProcessor, { BillUpdates } from "./BillProcessor"

/** Input bill for event matching */
export type EventMatchBill = {
  id: string
  court?: number
  nextHearingId?: string
}

/** Computes event updates for bills based on hearing data */
export function computeEventUpdates(
  bills: EventMatchBill[],
  hearings: Hearing[],
  now: Timestamp
): BillUpdates {
  const updates: BillUpdates = new Map()

  // Build a map of billId -> court for matching
  const billCourtMap = new Map<string, number>()
  bills.forEach(bill => {
    if (bill.id && bill.court !== undefined) {
      billCourtMap.set(bill.id, bill.court)
    }
  })

  // Build mapping from billId -> hearingIds and compute earliest upcoming hearing
  const hearingIdsByBill = new Map<string, Set<string>>()

  hearings.forEach(hearing => {
    const hearingId = hearing.id
    const startsAt = hearing.startsAt

    hearing.content.HearingAgendas.forEach(agenda => {
      agenda.DocumentsInAgenda.forEach(doc => {
        const billId = doc.BillNumber
        const docCourtNumber = doc.GeneralCourtNumber

        // Only match hearings with bills from the same general court
        const billCourt = billCourtMap.get(billId)
        if (billCourt === undefined || billCourt !== docCourtNumber) {
          return
        }

        if (!hearingIdsByBill.has(billId))
          hearingIdsByBill.set(billId, new Set())
        hearingIdsByBill.get(billId)!.add(hearingId)

        // Track next upcoming hearing per bill (startsAt in the future)
        if (startsAt.toMillis() >= now.toMillis()) {
          const existing = updates.get(billId)
          if (
            !existing ||
            (existing.nextHearingAt as Timestamp | undefined)?.toMillis?.()! >
              startsAt.toMillis()
          ) {
            updates.set(billId, {
              nextHearingAt: startsAt,
              nextHearingId: hearingId
            })
          }
        }
      })
    })
  })

  hearingIdsByBill.forEach((ids, billId) => {
    const existing = updates.get(billId) ?? {}
    updates.set(billId, {
      ...existing,
      hearingIds: Array.from(ids)
    })
  })

  // Remove the next hearing on any bills that previously had an upcoming hearing
  // but are no longer on any upcoming hearing agendas.
  const upcomingHearingBillIds = new Set<string>()
  updates.forEach((u, id) => {
    if ((u.nextHearingAt as Timestamp | undefined)?.toMillis?.())
      upcomingHearingBillIds.add(id)
  })
  const existingBillsWithEvents = bills
    .filter(b => !!b.nextHearingId)
    .map(b => b.id as string)
  const billsWithRemovedEvents = difference(
    existingBillsWithEvents,
    Array.from(upcomingHearingBillIds)
  )
  billsWithRemovedEvents.forEach(id => {
    const existing = updates.get(id) ?? {}
    updates.set(id, {
      ...existing,
      nextHearingAt: FieldValue.delete(),
      nextHearingId: FieldValue.delete()
    })
  })

  return updates
}

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
    return ["id", "court", "nextHearingId"]
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
      .where("type", "==", "hearing")
      .get()
      .then(this.load(Hearing))
    const now = Timestamp.fromMillis(Date.now())
    return computeEventUpdates(this.bills, hearings, now)
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
