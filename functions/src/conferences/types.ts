import {
  Array,
  Literal as L,
  Number,
  Optional,
  Record,
  Static,
  String,
  Union
} from "runtypes"
import { Branch, Id, withDefaults } from "../common"

/** Where an authored section came from. Attribution is structural so the page
 * renders it consistently rather than relying on prose. */
export type ConferenceSource = Static<typeof ConferenceSource>
export const ConferenceSource = Record({
  organisation: String,
  url: String,
  publishedAt: Optional(String)
})

/** One point the chambers disagree on, with a short blob per chamber. Written
 * by journalists, never computed from the texts. */
export type ConferenceDifference = Static<typeof ConferenceDifference>
export const ConferenceDifference = Record({
  heading: String,
  senate: String,
  house: String,
  source: Optional(ConferenceSource)
})

/** One point where the two texts match, with a short explanation. */
export type ConferenceSimilarity = Static<typeof ConferenceSimilarity>
export const ConferenceSimilarity = Record({
  heading: String,
  body: String,
  source: Optional(ConferenceSource)
})

export type Conferee = Static<typeof Conferee>
export const Conferee = Record({
  memberCode: String,
  branch: Branch
})

export type ConferenceStatus = Static<typeof ConferenceStatus>
export const ConferenceStatus = Union(
  L("appointed"),
  L("reportFiled"),
  L("enacted"),
  L("dissolved")
)

/** A committee of conference: the ad-hoc group appointed to reconcile the
 * House and Senate versions of a bill. It references its bills, conferees and
 * hearings; nothing points back. The count fields are owned by the testimony
 * triggers. */
export type Conference = Static<typeof Conference>
export const Conference = withDefaults(
  Record({
    id: String,
    court: Number,
    title: String,
    senateBillId: Id,
    houseBillId: Id,
    /** The bill whose history carries the appointment actions, one of the
     * pair. Testimony on the conference is filed against this bill. */
    canonicalBillId: Id,
    conferees: Array(Conferee),
    status: ConferenceStatus,
    /** Linked by hand: conference hearings arrive with an empty agenda and no
     * committee code. */
    hearingIds: Array(String),
    differences: Array(ConferenceDifference),
    similarities: Array(ConferenceSimilarity),
    testimonyCount: Number,
    passNothingCount: Number,
    passSomethingCount: Number,
    passSenateVersionCount: Number,
    passHouseVersionCount: Number
  }),
  {
    hearingIds: [],
    differences: [],
    similarities: [],
    testimonyCount: 0,
    passNothingCount: 0,
    passSomethingCount: 0,
    passSenateVersionCount: 0,
    passHouseVersionCount: 0
  }
)

/** The fields the testimony triggers own. The sync carries these over from the
 * current document instead of taking them from YAML. */
export const conferenceCountFields = [
  "testimonyCount",
  "passNothingCount",
  "passSomethingCount",
  "passSenateVersionCount",
  "passHouseVersionCount"
] as const
