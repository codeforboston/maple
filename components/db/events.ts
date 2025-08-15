import {
  collection,
  getDocs,
  orderBy,
  Timestamp,
  where
} from "firebase/firestore"
import { useAsync } from "react-async-hook"
import { firestore } from "../firebase"
import { midnight, nullableQuery } from "./common"
import { DateTime } from "luxon"

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

type SpecialEvent = BaseEvent & {
  type: "specialEvent"
  content: SpecialEventContent
}
type SpecialEventContent = BaseContent

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

export type Event = Session | SpecialEvent | Hearing

/** Returns upcoming events, or undefined if loading or an error occured. */
export function useUpcomingEvents() {
  const hearings = useAsync(() => listUpcomingEvents(), [])
  return hearings.status === "success" ? hearings.result : undefined
}

export async function listUpcomingEvents(types?: Event["type"][]) {
  const eventsRef = collection(firestore, `/events`)
  const result = await getDocs(
    nullableQuery(
      eventsRef,
      types && where("type", "in", types),
      where("startsAt", ">=", midnight()),
      orderBy("starts", "asc")
    )
  )

  return result.docs.map(d => d.data() as Event)
}

/** returns true if input is a timestamp and false if not */
export const isTimestamp = (t: any): t is Timestamp => {
  return t && t.seconds !== undefined && t.nanoseconds !== undefined
}

/** converts time representation to a Timestamp if possible or else throws error */
export function parseTimestamp(t: any): Timestamp {
  if (isTimestamp(t)) return t
  if (t && typeof t === "object" && t._seconds !== undefined)
    return new Timestamp(t._seconds, t._nanoseconds)
  if (t && typeof t === "number") {
    if (t > 1_000_000_000_000) t = Math.floor(t / 1000)
    return new Timestamp(t, 0)
  }
  throw Error(`Invalid timestamp: ${t}`)
}

/** returns true if date is current date or later, otherwise returns false. throws error if input can't be parsed as a Timestamp */
export function dateInFuture(a: Timestamp | number | object | undefined) {
  if (a === undefined) return false
  const today = Timestamp.now().seconds
  const eventDate = parseTimestamp(a).seconds

  return eventDate >= today
}
