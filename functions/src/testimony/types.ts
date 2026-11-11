import {
  Array,
  Boolean,
  InstanceOf,
  Literal as L,
  Number,
  Optional,
  Record as R,
  String as RtString,
  Static,
  Union
} from "runtypes"
import { Role } from "../auth/types"
import { Id, Maybe, withDefaults } from "../common"
import { Timestamp } from "../firebase"
import { cosignShape } from "./cosign"

const maxTestimonyLength = 10_000

/** Whether a bill should pass. */
export type BillPosition = Static<typeof BillPosition>
export const BillPosition = Union(L("endorse"), L("oppose"), L("neutral"))
/** Which version a committee of conference should report, if any. */
export type ConferencePosition = Static<typeof ConferencePosition>
export const ConferencePosition = Union(
  L("passNothing"),
  L("passSomething"),
  L("passSenateVersion"),
  L("passHouseVersion")
)
export type Position = Static<typeof Position>
export const Position = Union(BillPosition, ConferencePosition)

const BaseTestimony = R({
  billId: Id,
  court: Number,
  position: Position,
  /** Empty only on a cosign, whose note is optional. */
  content: RtString.withConstraint(s => s.length < maxTestimonyLength),
  attachmentId: Maybe(RtString),
  /** Only present if testimony was edited (has a version greater than 1) */
  editReason: Maybe(RtString),
  ballotQuestionId: Maybe(RtString),
  /** Set when the testimony targets a committee of conference rather than the
   * bill alone. `billId` is then the conference's canonical bill. */
  conferenceId: Maybe(RtString),
  /** Set when the testimony cosigns another: the cosigned publication's id
   * and its author, which together locate it. A cosign takes its parent's
   * position when first published and keeps it. */
  cosignOfId: Maybe(RtString),
  cosignOfAuthorUid: Maybe(RtString)
})

export type Testimony = Static<typeof Testimony>
export const Testimony = withDefaults(
  BaseTestimony.extend({
    id: Id,
    authorUid: Id,
    authorDisplayName: RtString,
    authorRole: Role,
    billTitle: RtString,
    version: Number,
    public: Boolean,
    publishedAt: InstanceOf(Timestamp),
    updatedAt: InstanceOf(Timestamp),
    representativeId: Optional(RtString),
    senatorId: Optional(RtString),
    senatorDistrict: Optional(RtString),
    representativeDistrict: Optional(RtString),
    draftAttachmentId: Maybe(RtString),
    fullName: RtString,
    /** When the testimony was first published. Edits keep it, unlike
     * `publishedAt`. Missing on testimony published before it was recorded. */
    firstPublishedAt: Optional(InstanceOf(Timestamp)),
    /** On cosigned testimony, the tally of its cosigns. See cosignTally. */
    cosignCount: Optional(Number),
    cosignSenateDistrictCount: Optional(Number),
    cosignHouseDistrictCount: Optional(Number),
    lastCosignedAt: Optional(InstanceOf(Timestamp))
  }),
  {
    authorRole: "user",
    // ID is backfilled
    id: "unknown",
    publishedAt: Timestamp.fromMillis(0),
    updatedAt: Timestamp.fromMillis(0),
    public: true,
    authorDisplayName: "Anonymous",
    fullName: "Anonymous",
    billTitle: ""
  }
)

/** The positions a testimony may take: conference testimony takes a
 * conference position, all other testimony a bill position. */
export const positionsFor = (conferenceId?: string | null) =>
  conferenceId ? ConferencePosition : BillPosition

export const positionMatchesTarget = ({
  position,
  conferenceId
}: {
  position: Position
  conferenceId?: string | null
}) =>
  positionsFor(conferenceId).guard(position) ||
  (conferenceId
    ? "Conference testimony takes a conference position"
    : "Bill testimony takes a bill position")

/** A testimony is about one thing: its bill, a ballot question on it, or a
 * conference on it. */
export const oneTarget = ({
  ballotQuestionId,
  conferenceId
}: {
  ballotQuestionId?: string | null
  conferenceId?: string | null
}) =>
  !(ballotQuestionId && conferenceId) ||
  "Testimony targets a ballot question or a conference, not both"

export type DraftTestimony = Static<typeof DraftTestimony>
export const DraftTestimony = BaseTestimony.extend({
  publishedVersion: Optional(Number)
})
  .withConstraint(positionMatchesTarget)
  .withConstraint(oneTarget)
  .withConstraint(cosignShape)

/** The refusals the website words for itself, sent as the error's details. */
export type RefusalDetails = {
  refusal: "conferenceClosed" | "cosignParentGone"
}

export const countsByPositions = {
  endorse: "endorseCount",
  neutral: "neutralCount",
  oppose: "opposeCount",
  passNothing: "passNothingCount",
  passSomething: "passSomethingCount",
  passSenateVersion: "passSenateVersionCount",
  passHouseVersion: "passHouseVersionCount"
} as const

/** The count fields the testimony triggers own on bills and ballot questions. */
export const billCountFields = [
  "testimonyCount",
  "endorseCount",
  "neutralCount",
  "opposeCount"
] as const

export const TestimonySearchRecord = R({
  id: RtString,
  billId: RtString,
  /** Space-separated forms of billId so "S 531" matches. See
   * functions/src/bills/numberVariants.ts. */
  billIdVariants: Array(RtString),
  court: Number,
  position: Position,
  content: RtString,
  authorUid: RtString,
  authorRole: RtString,
  authorDisplayName: RtString,
  version: Number,
  public: Boolean,
  publishedAt: Number,
  updatedAt: Number,
  fullName: RtString
})
export type TestimonySearchRecord = Static<typeof TestimonySearchRecord>
