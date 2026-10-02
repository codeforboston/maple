import { Timestamp } from "firebase-admin/firestore"
import {
  Array,
  Boolean,
  Literal,
  InstanceOf,
  Number,
  Optional,
  Partial,
  Record,
  Static,
  String,
  Union,
  Null
} from "runtypes"

// Types in our database

export type CommitteeVoteResponse = Static<typeof CommitteeVoteResponse>
export const CommitteeVoteResponse = Union(
  Literal("Favorable"),
  Literal("Adverse"),
  Literal("ReserveRight"),
  Literal("NoVote")
)

export type Branch = Static<typeof Branch>
export const Branch = Union(Literal("Senate"), Literal("House"))

export type VoteType = Static<typeof VoteType>
export const VoteType = Union(Literal("RollCall"), Literal("Committee"))

export type CommitteeVote = Static<typeof CommitteeVote>
export const CommitteeVote = Record({
  response: CommitteeVoteResponse,
  memberCode: String
})

export type CommitteeVotes = Static<typeof CommitteeVotes>
export const CommitteeVotes = Record({
  type: VoteType,
  generalCourtNumber: Number,
  bill: String,
  committee: String
})

export type RollCallResponse = Static<typeof RollCallResponse>
export const RollCallResponse = Union(
  Literal("Yea"),
  Literal("Nay"),
  Literal("Abstain"),
  Literal("Present")
)

export type RollCallVote = Static<typeof RollCallVote>
export const RollCallVote = Record({
  response: RollCallResponse,
  memberCode: String,
  generalCourtNumber: Number,
  rollCallNumber: Number,
  branch: Branch
})

// Roll call API provides less information -
// most importantly, it does not have the associated bill
export type SenateRollCall = Static<typeof SenateRollCall>
export const SenateRollCall = Record({
  type: VoteType,
  generalCourtNumber: Number,
  branch: Branch,
  rollCallNumber: Number,
  questionMotion: Union(String, Null),
  downloadUrl: String
})

export type HouseRollCall = Static<typeof HouseRollCall>
export const HouseRollCall = Record({
  type: VoteType,
  generalCourtNumber: Number,
  branch: Branch,
  time: InstanceOf(Timestamp),
  bill: Union(String, Null),
  rollCallNumber: Number,
  questionMotion: String,
  downloadUrl: String
})

// Types from MA Legislature API

export type LegislativeMemberSummary = Static<typeof LegislativeMemberSummary>
export const LegislativeMemberSummary = Record({
  GeneralCourtNumber: Number,
  MemberCode: Optional(String),
  Details: Optional(String)
})

export type RollCallSummary = Static<typeof RollCallSummary>
export const RollCallSummary = Record({
  GeneralCourtNumber: Number,
  Branch: Optional(String),
  RollCallNumber: Number,
  Details: Optional(String)
})

export type APIRollCall = Static<typeof APIRollCall>
export const APIRollCall = Record({
  GeneralCourtNumber: Number,
  Branch: Optional(String),
  QuestionMotion: Optional(Union(String, Null)),
  RollCallNumber: Number,
  Yeas: Optional(Array(LegislativeMemberSummary)),
  Nays: Optional(Array(LegislativeMemberSummary)),
  Absent: Optional(Array(LegislativeMemberSummary)),
  DownloadUrl: Optional(String)
})

export type FiscalAmount = Static<typeof FiscalAmount>
export const FiscalAmount = Record({
  FiscalType: Optional(String),
  Amount: Optional(String)
})

export type CommitteeVoteRecord = Static<typeof CommitteeVoteRecord>
export const CommitteeVoteRecord = Record({
  Favorable: Optional(Array(LegislativeMemberSummary)),
  Adverse: Optional(Array(LegislativeMemberSummary)),
  ReserveRight: Optional(Array(LegislativeMemberSummary)),
  NoVoteRecorded: Optional(Array(LegislativeMemberSummary))
})

export type BillSponsor = Static<typeof BillSponsor>
export const BillSponsor = Record({
  Id: Optional(String),
  Name: Optional(String),
  /**
   * Type of the Bill Sponsor:
   * 1 = Legislative Member
   * 2 = Committee
   * 3 = Public Request
   * 4 = Special Request
   */
  Type: Number,
  /**
   * Only Committees and Legislative Members will have further details.
   */
  Details: Optional(String),
  ResponseDate: Optional(String)
})

export type CommitteeVoteBill = Static<typeof CommitteeVoteBill>
export const CommitteeVoteBill = Record({
  BillNumber: Optional(String),
  DocketNumber: Optional(String),
  Title: Optional(String),
  PrimarySponsor: Optional(BillSponsor),
  Cosponsors: Optional(Array(BillSponsor)),
  JointSponsor: Optional(BillSponsor),
  GeneralCourtNumber: Number,
  Details: Optional(String),
  IsDocketBookOnly: Boolean
})

export type Committee = Static<typeof Committee>
export const Committee = Record({
  CommitteeCode: Optional(String),
  GeneralCourtNumber: Optional(Number),
  Details: Optional(String)
})

export type APICommitteeVote = Static<typeof APICommitteeVote>
export const APICommitteeVote = Record({
  Question: Optional(String),
  Bill: Optional(CommitteeVoteBill),
  Committee: Optional(Committee),
  Date: String,
  Vote: Optional(Array(CommitteeVoteRecord))
})

export type CommitteeRecommendation = Static<typeof CommitteeRecommendation>
export const CommitteeRecommendation = Record({
  Action: Optional(String),
  FiscalAmounts: Optional(Array(FiscalAmount)),
  Committee: Optional(Committee),
  Votes: Optional(Array(APICommitteeVote))
})

export type Attachment = Static<typeof Attachment>
export const Attachment = Record({
  Description: Optional(String),
  DownloadUrl: Optional(String)
})

export type AmendmentSummary = Static<typeof AmendmentSummary>
export const AmendmentSummary = Record({
  GeneralCourtNumber: Number
}).And(
  Partial({
    AmendmentNumber: String,
    ParentBillNumber: String,
    Branch: String,
    Details: String
  })
)

export type APIDocument = Static<typeof APIDocument>
export const APIDocument = Record({
  GeneralCourtNumber: Number
}).And(
  Partial({
    Title: String,
    BillNumber: String,
    DocketNumber: String,
    PrimarySponsor: BillSponsor,
    Cosponsors: Array(BillSponsor),
    JointSponsor: BillSponsor,
    BillHistory: String,
    LegislationTypeName: String,
    Pinslip: String,
    DocumentText: String,
    EmergencyPreamble: String,
    RollCalls: Array(RollCallSummary),
    Attachments: Array(Attachment),
    CommitteeRecommendations: Array(CommitteeRecommendation),
    Amendments: Array(AmendmentSummary)
  })
)
