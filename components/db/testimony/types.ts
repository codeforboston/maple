import { Timestamp } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import {
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
  attachmentId: Maybe(String)
})
export type BaseTestimony = Static<typeof BaseTestimony>

export type Testimony = Static<typeof Testimony>
export const Testimony = BaseTestimony.extend({
  authorUid: Id,
  id: Id,
  authorDisplayName: String,
  version: Number,
  publishedAt: InstanceOf(Timestamp),
  representativeId: Optional(String),
  senatorId: Optional(String),
  senatorDistrict: Optional(String),
  representativeDistrict: Optional(String),
  draftAttachmentId: Maybe(String)
})

export type WorkingDraft = Partial<DraftTestimony>
export type DraftTestimony = Static<typeof DraftTestimony>
export const DraftTestimony = BaseTestimony.extend({
  publishedVersion: Optional(Number)
})

export type WithId<T> = { id: string; value: T }

export const deleteTestimony = httpsCallable<
  { publicationId: string },
  { deleted: boolean }
>(functions, "deleteTestimony")

export const publishTestimony = httpsCallable<
  { draftId: string },
  { publicationId: string }
>(functions, "publishTestimony")
