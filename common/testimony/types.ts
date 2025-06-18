import { Role } from "components/auth"
import { Timestamp } from "common/types"
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
import { Id, Maybe } from "../types"
import { withDefaults } from "common/common"

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
export const Testimony = withDefaults(
  BaseTestimony.extend({
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

export type WorkingDraft = Partial<DraftTestimony>
export type DraftTestimony = Static<typeof DraftTestimony>
export const DraftTestimony = BaseTestimony.extend({
  publishedVersion: Optional(Number),
  /** If present, array of legislator member codes */
  recipientMemberCodes: Maybe(Array(String))
})

export const countsByPositions = {
  endorse: "endorseCount",
  neutral: "neutralCount",
  oppose: "opposeCount"
} as const

export const TestimonySearchRecord = R({
  id: String,
  billId: String,
  court: Number,
  position: Union(L("endorse"), L("oppose"), L("neutral")),
  content: String,
  authorUid: String,
  authorRole: String,
  authorDisplayName: String,
  version: Number,
  public: Boolean,
  publishedAt: Number,
  updatedAt: Number,
  fullName: String
})
export type TestimonySearchRecord = Static<typeof TestimonySearchRecord>

export type WithId<T> = { id: string; value: T }
