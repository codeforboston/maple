import { onSchedule } from "firebase-functions/v2/scheduler"
import * as logger from "firebase-functions/logger"
import { Conference } from "../conferences/types"
import { db, Timestamp } from "../firebase"
import { timeZone } from "../malegislature"
import { resolveRecipients } from "../email/recipients"
import { splitMemberName } from "../shared/names"
import { takesTestimony } from "../shared/conferences"
import { Testimony } from "../testimony/types"
import { stateOf } from "./inputEvents"
import { ConferenceInputEvent, ConferenceUpdate } from "./types"
import {
  buildConferenceUpdateEmail,
  conferenceUpdateSubject,
  renderConferenceUpdate,
  renderConferenceUpdateText,
  summarize,
  tally,
  weekWindow
} from "./weeklyUpdate"

const ALREADY_EXISTS = 6
const REPLY_TO = "info@mapletestimony.org"
const DEFAULT_FROM = "notifications@mapletestimony.org"

/** "Sen. Crighton" or "Rep. Peisch", for a header's To line, and the address
 * the update goes to, if the member document has one. */
const conferee = async (court: number, c: Conference["conferees"][number]) => {
  const snap = await db
    .doc(`/generalCourts/${court}/members/${c.memberCode}`)
    .get()
  const name: string | undefined = snap.data()?.content?.Name
  const email: string | undefined = snap.data()?.content?.EmailAddress?.trim()
  return {
    memberCode: c.memberCode,
    email: email || undefined,
    name: `${c.branch === "Senate" ? "Sen." : "Rep."} ${
      name ? splitMemberName(name).surname : c.memberCode
    }`,
    chair: c.chair === true
  }
}

/** Compiles the update for each appointed conference that had a
 * change in the week up to `now`, and stores it as
 * /conferenceUpdates/{court}_{conferenceId}_{week}. Creating it rather than
 * setting it means a second run in the same week leaves the first update as
 * it was. */
export async function compileWeeklyUpdates(now = new Date()) {
  const { week, start, end } = weekWindow(now)
  const events = await db
    .collection("/conferenceInputEvents")
    .where("at", ">=", Timestamp.fromDate(start.toJSDate()))
    .where("at", "<", Timestamp.fromDate(end.toJSDate()))
    .get()

  const eventsOf = new Map<string, ConferenceInputEvent[]>()
  for (const doc of events.docs) {
    const e = doc.data() as ConferenceInputEvent
    const key = `${e.court}/${e.conferenceId}`
    eventsOf.set(key, [...(eventsOf.get(key) ?? []), e])
  }

  let stored = 0
  for (const [key, conferenceEvents] of eventsOf) {
    const { court, conferenceId: id } = conferenceEvents[0]
    try {
      const snap = await db
        .doc(`/generalCourts/${court}/conferences/${id}`)
        .get()
      const conference = snap.data() as Conference | undefined
      if (!conference || !takesTestimony(conference)) continue

      const published = await db
        .collectionGroup("publishedTestimony")
        .where("conferenceId", "==", id)
        .select("court", "authorRole", "position", "version")
        .get()
      const standing = tally(
        published.docs
          .map(d => d.data() as Testimony)
          .filter(t => t.court === court)
          .flatMap(t => stateOf(t) ?? [])
      )

      const changes = summarize(conferenceEvents)
      const conferees = await Promise.all(
        conference.conferees.map(c => conferee(court, c))
      )
      const data = buildConferenceUpdateEmail({
        conference,
        conferees,
        standing,
        changes,
        week,
        now
      })
      const html = renderConferenceUpdate(data)
      const reachable = conferees.filter(c => c.email)
      const update: ConferenceUpdate = {
        court,
        conferenceId: id,
        weekStart: Timestamp.fromDate(week.toJSDate()),
        standing,
        changes,
        html,
        delivery: {
          sentTo: reachable.map(c => c.memberCode),
          skipped: conferees.filter(c => !c.email).map(c => c.memberCode)
        },
        createdAt: Timestamp.now()
      }

      // One batch, so the update and its email exist together or not at all:
      // a second run finds the update and sends nothing.
      const updateRef = db
        .collection("/conferenceUpdates")
        .doc(`${court}_${id}_${week.toISODate()}`)
      const batch = db.batch()
      batch.create(updateRef, update)
      const { to, subjectPrefix } = resolveRecipients(
        reachable.map(c => c.email!)
      )
      if (to.length) {
        batch.create(db.collection("emails").doc(updateRef.id), {
          to,
          from: `"MAPLE" <${process.env.CONFEREE_UPDATE_FROM ?? DEFAULT_FROM}>`,
          replyTo: REPLY_TO,
          // The extension reads headers from the document, not from `message`.
          headers: {
            "X-SMTPAPI": JSON.stringify({ category: ["conferee-update"] })
          },
          message: {
            subject: subjectPrefix + conferenceUpdateSubject(data),
            text: renderConferenceUpdateText(data),
            html
          },
          createdAt: Timestamp.now()
        })
      } else {
        logger.warn(`No recipients for the update to conference ${key}`)
      }
      try {
        await batch.commit()
        stored++
      } catch (e) {
        if ((e as { code?: number }).code !== ALREADY_EXISTS) throw e
      }
    } catch (e) {
      logger.error(`Weekly update for conference ${key} failed`, e)
    }
  }
  logger.info(`Stored ${stored} weekly conference updates`)
}

export const compileConferenceUpdates = onSchedule(
  {
    schedule: "0 8 * * 1", // Monday 8:00 AM
    timeZone,
    timeoutSeconds: 300
  },
  () => compileWeeklyUpdates()
)
