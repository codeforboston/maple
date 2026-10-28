import { Role } from "components/auth"
import { Timestamp } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import {
  Array,
  Boolean,
  InstanceOf,
  Literal as L,
  Number,
  Optional,
  Record as R,
  Static,
  String,
  Union
} from "runtypes"
import { functions } from "../../firebase"
import { Id, Maybe } from "../common"
import type * as report from "functions/src/testimony/resolveReport"

export const maxTestimonyLength = 10_000

export const Position = Union(L("endorse"), L("oppose"), L("neutral"))
export type Position = Static<typeof Position>

/** What testimony on a committee of conference asks for. Kept apart from
 * `Position` so the bill and ballot question displays never see these. */
export const ConferencePosition = Union(
  L("passSomething"),
  L("passSenateVersion"),
  L("passHouseVersion"),
  L("passNothing")
)
export type ConferencePosition = Static<typeof ConferencePosition>

export const Content = String.withConstraint(
  s => s.length > 0 || "Content is empty"
).withConstraint(s => s.length < maxTestimonyLength || "Content is too long")
export type Content = Static<typeof Content>

export const BaseTestimony = R({
  billId: String,
  court: Number,
  position: Position,
  content: Content,
  attachmentId: Maybe(String),
  editReason: Maybe(String),
  ballotQuestionId: Maybe(String),
  conferenceId: Maybe(String)
})
export type BaseTestimony = Static<typeof BaseTestimony>

/** A testimony is about one thing: its bill, a ballot question on it, or a
 * conference on it. */
const oneTarget = ({
  ballotQuestionId,
  conferenceId
}: {
  ballotQuestionId?: string | null
  conferenceId?: string | null
}) =>
  !(ballotQuestionId && conferenceId) ||
  "Testimony targets a ballot question or a conference, not both"

export type Testimony = Static<typeof Testimony>
export const Testimony = BaseTestimony.extend({
  authorUid: Id,
  id: Id,
  authorDisplayName: String,
  authorRole: Role,
  billTitle: String,
  version: Number,
  public: Boolean,
  publishedAt: InstanceOf(Timestamp),
  updatedAt: InstanceOf(Timestamp),
  representativeId: Optional(String),
  senatorId: Optional(String),
  senatorDistrict: Optional(String),
  representativeDistrict: Optional(String),
  draftAttachmentId: Maybe(String),
  fullName: String
}).withConstraint(oneTarget)

export type WorkingDraft = Partial<DraftTestimony>
export type DraftTestimony = Static<typeof DraftTestimony>
const DraftTestimonyFields = BaseTestimony.extend({
  publishedVersion: Optional(Number),
  /** If present, array of legislator member codes */
  recipientMemberCodes: Maybe(Array(String))
})
export const DraftTestimony = DraftTestimonyFields.withConstraint(oneTarget)

/** Testimony and drafts as they read when `conferenceId` is set. The listing
 * and edit hooks for conferences return these; every other hook returns the
 * three-position types above. */
export type ConferenceTestimony = Omit<Testimony, "position"> & {
  position: ConferencePosition
}
export type ConferenceWorkingDraft = Omit<WorkingDraft, "position"> & {
  position?: ConferencePosition
}
export const ConferenceDraftTestimony = DraftTestimonyFields.omit("position")
  .extend({ position: ConferencePosition })
  .withConstraint(oneTarget)

/** Returns true if both values are either falsy or strictly equal. */
const eqish = (a: any, b: any) => (a || undefined) === (b || undefined)

/** Returns true if the draft has user-visibly changed from the published
 * version./ */
export function hasDraftChanged(
  draft?: WorkingDraft,
  published?: Testimony
): boolean {
  if (!draft || !published) return false
  return (
    !eqish(published.position, draft.position) ||
    !eqish(published.content, draft.content) ||
    !eqish(published.draftAttachmentId, draft.attachmentId)
  )
}

export type WithId<T> = { id: string; value: T }

export const deleteTestimony = httpsCallable<
  { publicationId: string },
  { deleted: boolean }
>(functions, "deleteTestimonyV2")

export const publishTestimony = httpsCallable<
  { draftId: string },
  { publicationId: string }
>(functions, "publishTestimonyV2")

export const resolveReport = httpsCallable<report.Request, report.Response>(
  functions,
  "adminResolveReportV2"
)
