import {
  Array,
  InstanceOf,
  Number,
  Optional,
  Record,
  Static,
  String
} from "runtypes"
import { Id, Maybe, Nullable, NullStr, withDefaults } from "../common"
import { Timestamp } from "../firebase"

export type BillReference = Static<typeof BillReference>
export const BillReference = Record({
  BillNumber: NullStr,
  DocketNumber: NullStr,
  GeneralCourtNumber: Number
})

export type BillHistoryAction = Static<typeof BillHistoryAction>
export const BillHistoryAction = Record({
  Date: String,
  Branch: String,
  Action: String
})

export type BillHistory = Static<typeof BillHistory>
export const BillHistory = Array(BillHistoryAction)

export type CurrentCommittee = Static<typeof CurrentCommittee>
export const CommitteeMember = Record({
    id: String,
    name: String,
    email: NullStr
  }),
  CurrentCommittee = Record({
    id: String,
    name: String,
    houseChair: Maybe(CommitteeMember),
    senateChair: Maybe(CommitteeMember)
  })

export type BillContent = Static<typeof BillContent>
export const BillContent = Record({
  Pinslip: Nullable(String),
  Title: String,
  PrimarySponsor: Nullable(Record({ Name: String })),
  DocumentText: Maybe(String),
  Cosponsors: Array(Record({ Name: Maybe(String) }))
})

/** Represents a missing timestamp value. This allows documents without values
 * to appear in results when sorting by that value. */
export const MISSING_TIMESTAMP = Timestamp.fromMillis(0)

export type Bill = Static<typeof Bill>
export const Bill = withDefaults(
  Record({
    id: Id,
    court: Number,
    content: BillContent,
    cosponsorCount: Number,
    testimonyCount: Number,
    endorseCount: Number,
    neutralCount: Number,
    opposeCount: Number,
    nextHearingAt: Optional(InstanceOf(Timestamp)),
    nextHearingId: Optional(Id),
    latestTestimonyAt: Optional(InstanceOf(Timestamp)),
    latestTestimonyId: Optional(Id),
    fetchedAt: InstanceOf(Timestamp),
    history: BillHistory,
    similar: Array(Id),
    currentCommittee: Optional(CurrentCommittee),
    city: Optional(String)
  }),
  {
    court: 0,
    cosponsorCount: 0,
    testimonyCount: 0,
    endorseCount: 0,
    neutralCount: 0,
    opposeCount: 0,
    latestTestimonyAt: MISSING_TIMESTAMP,
    nextHearingAt: MISSING_TIMESTAMP,
    fetchedAt: MISSING_TIMESTAMP,
    history: [],
    similar: []
  }
)
