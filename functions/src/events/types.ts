import {
  Array,
  InstanceOf,
  Literal as L,
  Null,
  Number,
  Optional,
  Record,
  Runtype,
  Static,
  String,
  Union
} from "runtypes"
import { Id } from "../common"
import { Timestamp } from "../firebase"

const Nullable = <T extends Runtype>(r: T) => r.Or(Null)

export type BaseEventContent = Static<typeof BaseEventContent>
export const BaseEventContent = Record({
  EventId: Number,
  // EventDate and StartTime seem always to be the same, IOS 8601
  // 2022-02-18T10:00:00 strings in American/New_York.
  EventDate: String,
  StartTime: String
})

export type BaseEvent = Static<typeof BaseEvent>
export const BaseEvent = Record({
  id: Id,
  type: String,
  content: BaseEventContent,
  startsAt: InstanceOf(Timestamp),
  fetchedAt: InstanceOf(Timestamp)
})

export type SpecialEventContent = Static<typeof SpecialEventContent>
export const SpecialEventContent = BaseEventContent.extend({
  // HTML with style attributes. Sanitize?
  Description: Nullable(String)
})

export type SpecialEvent = Static<typeof SpecialEvent>
export const SpecialEvent = BaseEvent.extend({
  type: L("specialEvent"),
  content: SpecialEventContent
})

export type SessionContent = Static<typeof SessionContent>
export const SessionContent = BaseEventContent
export type Session = Static<typeof Session>
export const Session = BaseEvent.extend({
  type: L("session")
})
export type HearingLocation = Static<typeof HearingLocation>
export const HearingLocation = Record({
  AddressLine1: String,
  AddressLine2: Nullable(String),
  City: String,
  LocationName: String,
  State: String,
  ZipCode: String
})
export type HearingContent = Static<typeof HearingContent>
export const HearingContent = BaseEventContent.extend({
  Description: String,
  Name: String,
  Status: String,
  HearingHost: Record({
    CommitteeCode: String,
    GeneralCourtNumber: Number
  }),
  Location: HearingLocation,
  HearingAgendas: Array(
    Record({
      DocumentsInAgenda: Array(
        Record({
          BillNumber: String,
          GeneralCourtNumber: Number,
          PrimarySponsor: Nullable(Record({ Id: String })),
          Title: String
        })
      ),
      StartTime: String,
      EndTime: String,
      Topic: String
    })
  ),
  RescheduledHearing: Nullable(
    Record({
      EventDate: String,
      StartTime: String
    })
  )
})

export type HearingListItem = Static<typeof HearingListItem>
export const HearingListItem = Record({ EventId: Number })

export type Hearing = Static<typeof Hearing>
export const Hearing = BaseEvent.extend({
  type: L("hearing"),
  content: HearingContent,
  videoURL: Optional(String),
  videoTranscriptionId: Optional(String),
  videoFetchedAt: Optional(InstanceOf(Timestamp)),
  committeeChairs: Optional(Array(String))
})

export type Event = Static<typeof Event>
export const Event = Union(SpecialEvent, Session, Hearing)
