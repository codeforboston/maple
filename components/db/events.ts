import {
  collection,
  getDocs,
  orderBy,
  Timestamp,
  where
} from "firebase/firestore"
import { flattenDeep } from "lodash"
import { DateTime } from "luxon"
import { firestore } from "../firebase"
import { nullableQuery } from "./common"

/** The timezone used for datetime strings returned by the API. */
export const timeZone = "America/New_York"

type BaseContent = {
  EventId: number
  EventDate: string
  StartTime: string
}

type BaseEvent = {
  id: string
  type: string
  content: BaseContent
  startsAt: Timestamp
  fetchedAt: Timestamp
}

type Session = BaseEvent & { type: "session"; content: SessionContent }
type SessionContent = BaseContent & {
  Description: string | null
  GeneralCourtNumber: number
  LocationName: string
  Name: string
  Status: string
}

type SpecialEvent = BaseEvent & { type: "specialEvent" }

type Hearing = BaseEvent & { type: "hearing"; content: HearingContent }
type HearingContent = BaseContent & {
  Description: string
  Name: string
  Status: string
  HearingHost: {
    CommitteeCode: string
    GeneralCourtNumber: number
  }
  Location: HearingLocation
  HearingAgendas: {
    DocumentsInAgenda: {
      BillNumber: string
      GeneralCourtNumber: number
      PrimarySponsor: { Id: string }
      Title: string
    }[]
    StartTime: string
    EndTime: string
    Topic: string
  }[]
  RescheduledHearing: {
    Status: string
    EventDate: string
    StartTime: string
    Location: HearingLocation
  } | null
}
type HearingLocation = {
  AddressLine1: string
  AddressLine2: string
  City: string
  LocationName: string
  State: string
  ZipCode: string
}

type Event = Session | SpecialEvent | Hearing

export async function listUpcomingBills() {
  const result = await listUpcomingEvents({ types: ["hearing"] })
  const hearings = result as Hearing[]
  const bills = flattenDeep<{
    startsAt: Timestamp
    billId: string
    court: number
  }>(
    hearings.map(hearing =>
      hearing.content.HearingAgendas.map(agenda =>
        agenda.DocumentsInAgenda.map(doc => ({
          startsAt: parseApiDateTime(agenda.StartTime),
          billId: doc.BillNumber,
          court: doc.GeneralCourtNumber
        }))
      )
    )
  )

  return bills
}

export async function listUpcomingEvents({
  types
}: {
  types?: Event["type"][]
}) {
  const eventsRef = collection(firestore, `/events`)

  const result = await getDocs(
    nullableQuery(
      eventsRef,
      types && where("type", "in", types),
      where("startsAt", ">=", midnight()),
      orderBy("startsAt", "asc")
    )
  )

  return result.docs.map(d => d.data() as Event)
}

function midnight() {
  return DateTime.now()
    .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    .toJSDate()
}

function parseApiDateTime(dateTime: string): Timestamp {
  const time = DateTime.fromISO(dateTime, { zone: timeZone })
  return Timestamp.fromMillis(time.toMillis())
}
