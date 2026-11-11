import { onSchedule } from "firebase-functions/v2/scheduler"
import * as logger from "firebase-functions/logger"
import { Conference } from "../conferences/types"
import { db, Timestamp } from "../firebase"
import { timeZone } from "../malegislature"
import { splitMemberName } from "../shared/names"
import { takesTestimony } from "../shared/conferences"
import { Testimony } from "../testimony/types"
import { stateOf } from "./inputEvents"
import { ConferenceInputEvent, ConferenceUpdate } from "./types"
import {
  buildConferenceUpdateEmail,
  renderConferenceUpdate,
  summarize,
  tally,
  weekWindow
} from "./weeklyUpdate"

const ALREADY_EXISTS = 6

/** "Sen. Crighton" or "Rep. Peisch", for a header's To line. */
const conferee = async (court: number, c: Conference["conferees"][number]) => {
  const snap = await db
    .doc(`/generalCourts/${court}/members/${c.memberCode}`)
    .get()
  const name: string | undefined = snap.data()?.content?.Name
  return {
    name: `${c.branch === "Senate" ? "Sen." : "Rep."} ${
      name ? splitMemberName(name).surname : c.memberCode
    }`,
    chair: c.chair === true
  }
}

/** Compiles the update for each appointed conference that had a
 * change in the week before `now`, and stores it as
 * /conferenceUpdates/{court}_{conferenceId}_{week start}. Creating it
 * rather than setting it means a second run in the same week leaves the
 * first update as it was. */
export async function compileWeeklyUpdates(now = new Date()) {
  const { start, end } = weekWindow(now)
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
      const html = renderConferenceUpdate(
        buildConferenceUpdateEmail({
          conference,
          conferees: await Promise.all(
            conference.conferees.map(c => conferee(court, c))
          ),
          standing,
          changes,
          start,
          now
        })
      )
      const update: ConferenceUpdate = {
        court,
        conferenceId: id,
        weekStart: Timestamp.fromDate(start.toJSDate()),
        standing,
        changes,
        html,
        createdAt: Timestamp.now()
      }
      try {
        await db
          .collection("/conferenceUpdates")
          .doc(`${court}_${id}_${start.toISODate()}`)
          .create(update)
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
