import {
  Array,
  Boolean,
  InstanceOf,
  Literal as L,
  Number,
  Record,
  Static,
  String,
  Union
} from "runtypes"
import { Timestamp } from "../firebase"
import { Changes, Counts } from "../conferenceUpdates/types"

/** What every email to legislators records. `memberCodes` are the
 * legislators it went to; outside production, those it would have gone to
 * instead of the test address. `subject` is without the test prefix. */
const Sent = {
  court: Number,
  memberCodes: Array(String),
  subject: String,
  html: String,
  text: String,
  /** When the email was queued: the `emails` document's `createdAt`. */
  createdAt: InstanceOf(Timestamp)
}

/** A reader's conference input, mailed as a letter to their rep and senator. */
export type LetterRecord = Static<typeof LetterRecord>
export const LetterRecord = Record({
  kind: L("letter"),
  ...Sent,
  uid: String,
  testimonyId: String,
  /** The version of the published testimony the letter was written from. */
  version: Number,
  conferenceId: String,
  /** Sent as an update to an earlier letter, "(updated)" in its subject. */
  updated: Boolean
})

/** One conference's weekly update to its conferees. */
export type ConferenceUpdateRecord = Static<typeof ConferenceUpdateRecord>
export const ConferenceUpdateRecord = Record({
  kind: L("conferenceUpdate"),
  ...Sent,
  conferenceId: String,
  /** Monday 00:00, Eastern, of the week the update is named for. */
  weekStart: InstanceOf(Timestamp),
  /** The input on the conference when the update was compiled, where its
   * changes end. */
  standing: Counts,
  changes: Changes
})

/** An email MAPLE sent to legislators, as sent. Written with the `emails`
 * document that sends it, under the same id.
 * Firestore: /legislatorMail/{emails document id} */
export type LegislatorMail = Static<typeof LegislatorMail>
export const LegislatorMail = Union(LetterRecord, ConferenceUpdateRecord)

/** An email to legislators as the send-email extension takes it, before its
 * recipients are resolved: the subject is the one they see. */
export type LegislatorEmail = {
  from: string
  replyTo: string
  cc?: string[]
  headers: { [name: string]: string }
  message: { subject: string; text: string; html: string }
}
