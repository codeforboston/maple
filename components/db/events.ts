import { Timestamp } from "firebase/firestore"

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
