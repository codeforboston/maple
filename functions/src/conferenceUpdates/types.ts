import {
  InstanceOf,
  Literal as L,
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
 * `recordConferenceInput`. `at` is when the input was written, `recordedAt`
 * when this event was, which can be later; the letters and the weekly update
 * read the events recorded in their window, so a late event falls in the next
 * one rather than in none.
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
  at: InstanceOf(Timestamp),
  recordedAt: InstanceOf(Timestamp)
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
