import {
  InstanceOf,
  Literal as L,
  Number,
  Optional,
  Record as R,
  Static,
  String as RtString,
  Union
} from "runtypes"
import { Id, Maybe, withDefaults } from "../common"
import { Timestamp } from "../firebase"

const maxTestimonyLength = 10_000

const BaseTestimony = R({
  billId: Id,
  court: Number,
  position: Union(L("endorse"), L("oppose"), L("neutral")),
  content: RtString.withConstraint(
    s => s.length > 0 && s.length < maxTestimonyLength
  ),
  attachmentId: Maybe(RtString)
})

export type Testimony = Static<typeof Testimony>
export const Testimony = withDefaults(
  BaseTestimony.extend({
    authorUid: Id,
    authorDisplayName: RtString,
    version: Number,
    publishedAt: InstanceOf(Timestamp),
    representativeId: Optional(RtString),
    senatorId: Optional(RtString),
    senatorDistrict: Optional(RtString),
    representativeDistrict: Optional(RtString),
    draftAttachmentId: Maybe(RtString)
  }),
  { publishedAt: Timestamp.fromMillis(0), authorDisplayName: "Anonymous" }
)

export type DraftTestimony = Static<typeof DraftTestimony>
export const DraftTestimony = BaseTestimony.extend({
  publishedVersion: Optional(Number)
})
