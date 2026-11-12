import { onSchedule } from "firebase-functions/v2/scheduler"
import * as logger from "firebase-functions/logger"
import { createdUnlessExists } from "../common"
import { Conference } from "../conferences/types"
import { auth, db, Timestamp } from "../firebase"
import { timeZone } from "../malegislature"
import { stateOf } from "../conferenceUpdates/inputEvents"
import { ConferenceInputEvent } from "../conferenceUpdates/types"
import { Testimony } from "../testimony/types"
import { queueLegislatorEmail } from "../legislatorMail/queue"
import { lastLetterFor } from "../legislatorMail/records"
import { conferenceName } from "../shared/conferences"
import { hasLegislators, looksLikeEmail, renderLetter } from "./letter"
import { buildLetterEmail, dayWindow, SkipReason } from "./letters"

const DEFAULT_FROM = "notifications@mapletestimony.org"

type Content = Record<string, any> | undefined

/** Reads shared by many inputs, fetched once per run. */
const cached = <T>(read: (key: string) => Promise<T>) => {
  const seen = new Map<string, Promise<T>>()
  return (key: string) => {
    if (!seen.has(key)) seen.set(key, read(key))
    return seen.get(key)!
  }
}

const verifiedEmail = async (uid: string) => {
  try {
    const user = await auth.getUser(uid)
    return user.emailVerified && user.email ? user.email : undefined
  } catch (e) {
    logger.warn(`No auth user ${uid}`, e)
    return undefined
  }
}

// As the site names an author (`nameOf`): an empty full name falls back too.
const readerAuthor = (t: Testimony) => t.fullName || t.authorDisplayName

/** Mails the letter for one input, or says why it is not sent. */
async function mailLetter(
  e: ConferenceInputEvent,
  eventId: string,
  lastFor: Map<string, string>,
  memberContent: (key: string) => Promise<Content>,
  conferenceOf: (key: string) => Promise<Conference | undefined>
): Promise<SkipReason | "queued" | "exists"> {
  // An input posted or edited more than once in the window is mailed once,
  // with what is posted now.
  if (lastFor.get(e.testimonyId) !== eventId) return "superseded"

  const letterId = `letter_${eventId}`
  const [own, last, pubSnap, readerEmail, draft, conference] =
    await Promise.all([
      db.doc(`/legislatorMail/${letterId}`).get(),
      lastLetterFor(e.testimonyId),
      db.doc(`/users/${e.authorUid}/publishedTestimony/${e.testimonyId}`).get(),
      verifiedEmail(e.authorUid),
      db
        .collection(`/users/${e.authorUid}/draftTestimony`)
        .where("conferenceId", "==", e.conferenceId)
        .where("court", "==", e.court)
        .limit(1)
        .get(),
      conferenceOf(`${e.court}/${e.conferenceId}`)
    ])
  // This event's letter went out on an earlier run.
  if (own.exists) return "exists"
  const pub = pubSnap.data() as Testimony | undefined
  const state = pub && stateOf(pub)
  if (!pub || !state) return "withdrawn"
  // A version goes out once, and a letter is an update only to one that went
  // out before.
  if (last?.version === pub.version) return "alreadySent"
  const updated = !!last
  if (!readerEmail) return "noVerifiedEmail"
  if (!pub.representativeId && !pub.senatorId) return "noLegislator"
  if (!conference) return "noConference"

  // Only those who can receive it are written to, so the salutation names
  // exactly who gets the letter. The member document's own name and district
  // are used, as in the preview, falling back to the district recorded when
  // the input was posted.
  const reachable = await Promise.all(
    [
      [pub.representativeId, pub.representativeDistrict],
      [pub.senatorId, pub.senatorDistrict]
    ].map(async ([id, recorded]) => {
      const content = id ? await memberContent(`${e.court}/${id}`) : undefined
      const email: string | undefined = content?.EmailAddress?.trim()
      return id && content?.Name && email
        ? {
            memberCode: id,
            email,
            member: {
              name: content.Name as string,
              district: (content.District ?? recorded ?? "") as string
            }
          }
        : undefined
    })
  )
  const [representative, senator] = reachable.map(m => m?.member)
  if (!hasLegislators({ representative, senator })) {
    return "noLegislatorEmail"
  }

  let cosign: { author: string; content: string } | undefined
  if (pub.cosignOfId && pub.cosignOfAuthorUid) {
    const parent = (
      await db
        .doc(
          `/users/${pub.cosignOfAuthorUid}/publishedTestimony/${pub.cosignOfId}`
        )
        .get()
    ).data() as Testimony | undefined
    if (!parent) return "withdrawn"
    cosign = { author: readerAuthor(parent), content: parent.content }
  }

  const author = readerAuthor(pub)
  const chosen = (draft.docs[0]?.data().replyTo as string | null)?.trim()
  const letter = renderLetter({
    author,
    replyTo: chosen && looksLikeEmail(chosen) ? chosen : readerEmail,
    court: e.court,
    conferenceId: e.conferenceId,
    conference: conferenceName(conference),
    edited: updated,
    position: state.position,
    content: pub.content,
    cosign,
    representative,
    senator
  })
  return queueLegislatorEmail(
    letterId,
    reachable.flatMap(m => m?.email ?? []),
    buildLetterEmail({
      letter,
      author,
      fromAddress: process.env.LETTER_FROM ?? DEFAULT_FROM
    }),
    {
      kind: "letter",
      court: e.court,
      memberCodes: reachable.flatMap(m => m?.memberCode ?? []),
      uid: e.authorUid,
      testimonyId: e.testimonyId,
      version: pub.version,
      conferenceId: e.conferenceId,
      updated
    }
  )
}

/** Mails each conference input posted or edited since the run a day before `now` to
 * the reader's rep and senator, as the letter the reader previewed. A letter is the
 * `emails` document /emails/letter_{input event id} and its record at
 * /legislatorMail/letter_{input event id}, created, so a second run sends
 * nothing again. An input that is not mailed is recorded, with why, at
 * /conferenceLetterSkips/{input event id}. */
export async function sendConferenceLetters(now: Date) {
  const { start, end } = dayWindow(now)
  const events = await db
    .collection("/conferenceInputEvents")
    .where("at", ">=", Timestamp.fromDate(start.toJSDate()))
    .where("at", "<", Timestamp.fromDate(end.toJSDate()))
    .get()

  const written = events.docs
    .map(doc => ({ id: doc.id, e: doc.data() as ConferenceInputEvent }))
    .filter(({ e }) => e.change !== "withdrawn")
    .sort((a, b) => a.e.at.toMillis() - b.e.at.toMillis())
  const lastFor = new Map(written.map(({ id, e }) => [e.testimonyId, id]))
  const memberContent = cached(
    async key =>
      (
        await db.doc(`/generalCourts/${key.replace("/", "/members/")}`).get()
      ).data()?.content as Content
  )
  const conferenceOf = cached(
    async key =>
      (
        await db
          .doc(`/generalCourts/${key.replace("/", "/conferences/")}`)
          .get()
      ).data() as Conference | undefined
  )

  let sent = 0
  for (const { id, e } of written) {
    try {
      const outcome = await mailLetter(
        e,
        id,
        lastFor,
        memberContent,
        conferenceOf
      )
      if (outcome === "queued") sent++
      else if (outcome !== "exists") {
        await createdUnlessExists(
          db.doc(`/conferenceLetterSkips/${id}`).create({
            testimonyId: e.testimonyId,
            authorUid: e.authorUid,
            conferenceId: e.conferenceId,
            reason: outcome,
            createdAt: Timestamp.now()
          })
        )
      }
    } catch (err) {
      logger.error(`Letter for input event ${id} failed`, err)
    }
  }
  logger.info(
    `Mailed ${sent} conference letters from ${start.toISO()} to ${end.toISO()}`
  )
  return sent
}

export const mailConferenceLetters = onSchedule(
  { schedule: "0 9 * * *", timeZone, timeoutSeconds: 300 },
  // The time the run was due, not when it started, so each day's window
  // begins exactly where the last one ended.
  event =>
    sendConferenceLetters(new Date(event.scheduleTime)).then(() => undefined)
)
