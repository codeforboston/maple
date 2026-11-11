import {
  InstanceOf,
  Literal as L,
  Array,
  Number,
  Optional,
  Record,
  Static,
  String,
  Union
} from "runtypes"
import { Role } from "../auth/types"
import { Timestamp } from "../firebase"
import { ConferencePosition } from "../testimony/types"

/** The site's three kinds of author, as Public Input groups them. Mirrors
 * `accountTypeOf` in components/conference/input/accounts.ts. */
export type AuthorGroup = Static<typeof AuthorGroup>
export const AuthorGroup = Union(
  L("individual"),
  L("organization"),
  L("government")
)
export const authorGroups = AuthorGroup.alternatives.map(a => a.value)

export const authorGroupOf = (role: Role): AuthorGroup =>
  role === "organization"
    ? "organization"
    : role === "legislator"
    ? "government"
    : "individual"

/** How many inputs, in all and by author group and position. In a change it
 * is a signed difference. */
export type Counts = Static<typeof Counts>
export const Counts = Record({
  total: Number,
  byGroup: Record({
    individual: Number,
    organization: Number,
    government: Number
  }),
  byPosition: Record({
    passSomething: Number,
    passSenateVersion: Number,
    passHouseVersion: Number,
    passNothing: Number
  })
})

/** What a publication contributes to the update: the figures it is counted
 * under. */
export type InputState = Static<typeof InputState>
export const InputState = Record({
  position: ConferencePosition,
  group: AuthorGroup,
  version: Number
})

/** One conference input appearing, changing or going. Written by
 * `recordConferenceInput`; the weekly update reads a week of them.
 * Firestore: /conferenceInputEvents/{eventId} */
export type ConferenceInputEvent = Static<typeof ConferenceInputEvent>
export const ConferenceInputEvent = Record({
  court: Number,
  conferenceId: String,
  testimonyId: String,
  authorUid: String,
  change: Union(L("added"), L("edited"), L("withdrawn")),
  before: Optional(InputState),
  after: Optional(InputState),
  at: InstanceOf(Timestamp)
})

/** What changed in a week, as the update says it. `net` is the resulting
 * difference in the counts. */
export type Changes = Static<typeof Changes>
export const Changes = Record({
  added: Number,
  edited: Number,
  withdrawn: Number,
  net: Counts
})

/** Who an update was sent to, by member code. Skipped conferees have no
 * email address on their member document. */
export type Delivery = Static<typeof Delivery>
export const Delivery = Record({
  sentTo: Array(String),
  skipped: Array(String)
})

/** One conference's update for one week, stored so it can be sent.
 * Firestore: /conferenceUpdates/{court}_{conferenceId}_{weekStart date} */
export type ConferenceUpdate = Static<typeof ConferenceUpdate>
export const ConferenceUpdate = Record({
  court: Number,
  conferenceId: String,
  /** Monday 00:00, Eastern. The week runs to the next Monday. */
  weekStart: InstanceOf(Timestamp),
  /** The input on the conference when the update was compiled. */
  standing: Counts,
  changes: Changes,
  html: String,
  delivery: Delivery,
  createdAt: InstanceOf(Timestamp)
})
