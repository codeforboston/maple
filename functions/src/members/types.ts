import { Array, InstanceOf, Number, Record, Static, String } from "runtypes"
import { Id, NullStr } from "../common"
import { Timestamp } from "../firebase"

export type MemberReference = Static<typeof MemberReference>
export const MemberReference = Record({ MemberCode: String })

export type MemberContent = Static<typeof MemberContent>
export const MemberContent = Record({
  Name: String,
  GeneralCourtNumber: Number,
  MemberCode: String,
  LeadershipPosition: NullStr,
  District: NullStr,
  Party: NullStr,
  EmailAddress: NullStr,
  PhoneNumber: NullStr,
  FaxNumber: NullStr,
  RoomNumber: NullStr,
  Committees: Array(Record({ CommitteeCode: String })),
  SponsoredBills: Array(String),
  CoSponsoredBills: Array(String)
})

export type Member = Static<typeof Member>
export const Member = Record({
  id: Id,
  content: MemberContent,
  fetchedAt: InstanceOf(Timestamp)
})
