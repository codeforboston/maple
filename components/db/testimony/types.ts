import { Role } from "components/auth"
import { Timestamp } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import {
  Array,
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
  editReason: Maybe(String)
})
export type BaseTestimony = Static<typeof BaseTestimony>

export type Testimony = Static<typeof Testimony>
export const Testimony = BaseTestimony.extend({
  authorUid: Id,
  id: Id,
  authorDisplayName: String,
  authorRole: Role,
  billTitle: String,
  version: Number,
  publishedAt: InstanceOf(Timestamp),
  representativeId: Optional(String),
  senatorId: Optional(String),
  senatorDistrict: Optional(String),
  representativeDistrict: Optional(String),
  draftAttachmentId: Maybe(String),
  fullName: String
})

export type WorkingDraft = Partial<DraftTestimony>
export type DraftTestimony = Static<typeof DraftTestimony>
export const DraftTestimony = BaseTestimony.extend({
  publishedVersion: Optional(Number),
  /** If present, array of legislator member codes */
  recipientMemberCodes: Maybe(Array(String))
})

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
>(functions, "deleteTestimony")

export const publishTestimony = httpsCallable<
  { draftId: string },
  { publicationId: string }
>(functions, "publishTestimony")

export const resolveReport = httpsCallable<report.Request, report.Response>(
  functions,
  "adminResolveReport"
)
