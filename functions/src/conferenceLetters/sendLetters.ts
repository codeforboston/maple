import { onSchedule } from "firebase-functions/v2/scheduler"
import * as logger from "firebase-functions/logger"
import { Conference } from "../conferences/types"
import { resolveRecipients } from "../email/recipients"
import { auth, db, Timestamp } from "../firebase"
import { timeZone } from "../malegislature"
import { stateOf } from "../conferenceUpdates/inputEvents"
import { ConferenceInputEvent } from "../conferenceUpdates/types"
import { Testimony } from "../testimony/types"
import { conferenceName } from "../shared/conferences"
import { hasLegislators, looksLikeEmail, renderLetter } from "./letter"
import { buildLetterEmail, dayWindow, SkipReason } from "./letters"

const ALREADY_EXISTS = 6
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

const create = async (
  ref: FirebaseFirestore.DocumentReference,
  data: object
) => {
  try {
    await ref.create(data)
    return true
  } catch (e) {
    if ((e as { code?: number }).code !== ALREADY_EXISTS) throw e
    return false
  }
}

// As the site names an author (`nameOf`): an empty full name falls back too.
const readerAuthor = (t: Testimony) => t.fullName || t.authorDisplayName

/** The letter for one input, or why it is not sent. */
async function prepare(
  e: ConferenceInputEvent,
  eventId: string,
  lastFor: Map<string, string>,
  edited: boolean,
  memberContent: (key: string) => Promise<Content>,
  conferenceOf: (key: string) => Promise<Conference | undefined>
): Promise<{ skip: SkipReason } | { email: object }> {
  // An input posted or edited more than once in the window is mailed once,
  // with what is posted now.
  if (lastFor.get(e.testimonyId) !== eventId) return { skip: "superseded" }

  const [pubSnap, readerEmail, draft, conference] = await Promise.all([
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
  const pub = pubSnap.data() as Testimony | undefined
  const state = pub && stateOf(pub)
  if (!pub || !state) return { skip: "withdrawn" }
  if (!readerEmail) return { skip: "noVerifiedEmail" }
  if (!pub.representativeId && !pub.senatorId) return { skip: "noLegislator" }
  if (!conference) return { skip: "noConference" }

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
      return content?.Name && email
        ? {
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
    return { skip: "noLegislatorEmail" }
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
    if (!parent) return { skip: "withdrawn" }
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
    edited,
    position: state.position,
    content: pub.content,
    cosign,
    representative,
    senator
  })
  const { to, subjectPrefix } = resolveRecipients(
    reachable.flatMap(m => m?.email ?? [])
  )
  if (!to.length) return { skip: "noRecipients" }
  return {
    email: buildLetterEmail({
      letter,
      author,
      fromAddress: process.env.LETTER_FROM ?? DEFAULT_FROM,
      to,
      subjectPrefix,
      createdAt: Timestamp.now()
    })
  }
}

/** Mails each conference input posted or edited since the run a day before `now` to
 * the reader's rep and senator, as the letter the reader previewed. A letter is the
 * `emails` document /emails/letter_{input event id}, created, so a second run
 * sends nothing again. An input that is not mailed is recorded, with why, at
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
  // An edit is an update unless the input was also posted in the window.
  const postedIn = new Set(
    written
      .filter(({ e }) => e.change === "added")
      .map(({ e }) => e.testimonyId)
  )
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
      const edited = !postedIn.has(e.testimonyId)
      const result = await prepare(
        e,
        id,
        lastFor,
        edited,
        memberContent,
        conferenceOf
      )
      if ("skip" in result) {
        await create(db.doc(`/conferenceLetterSkips/${id}`), {
          testimonyId: e.testimonyId,
          authorUid: e.authorUid,
          conferenceId: e.conferenceId,
          reason: result.skip,
          createdAt: Timestamp.now()
        })
      } else if (await create(db.doc(`/emails/letter_${id}`), result.email)) {
        sent++
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
