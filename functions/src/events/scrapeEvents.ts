import { runWith } from "firebase-functions"
import { DateTime } from "luxon"
import { JSDOM } from "jsdom"
import { AssemblyAI } from "assemblyai"
import { logFetchError } from "../common"
import { db, Timestamp } from "../firebase"
import * as api from "../malegislature"
import {
  BaseEvent,
  BaseEventContent,
  Hearing,
  HearingContent,
  HearingListItem,
  Session,
  SessionContent,
  SpecialEvent,
  SpecialEventContent
} from "./types"
import { currentGeneralCourt } from "../shared"
import { randomBytes } from "node:crypto"
import { sha256 } from "js-sha256"
import { withinCutoff } from "./helpers"

const assembly = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_API_KEY ? process.env.ASSEMBLY_API_KEY : ""
})

abstract class EventScraper<ListItem, Event extends BaseEvent> {
  private schedule
  private timeout

  constructor(schedule: string, timeout: number) {
    this.schedule = schedule
    this.timeout = timeout
  }

  get function() {
    return runWith({ timeoutSeconds: this.timeout })
      .pubsub.schedule(this.schedule)
      .onRun(() => this.run())
  }

  abstract listEvents(): Promise<ListItem[]>
  abstract getEvent(item: ListItem): Promise<Event>

  private async run() {
    const list = await this.listEvents().catch(logFetchError("event list"))

    if (!list) return

    const writer = db.bulkWriter()
    const upcomingOrRecentCutoff = DateTime.now().minus({ days: 8 })

    for (let item of list) {
      const id = (item as any)?.EventId,
        event = await this.getEvent(item).catch(logFetchError("event", id))

      if (!event) continue
      if (event.startsAt.toMillis() < upcomingOrRecentCutoff.toMillis()) break

      writer.set(db.doc(`/events/${event.id}`), event, { merge: true })
    }

    await writer.close()
  }

  /** Parse the event start time in the time zone of the API. */
  getEventStart(content: { EventDate: string; StartTime: string }) {
    const { year, month, day } = DateTime.fromISO(content.EventDate, {
      zone: api.timeZone
    })
    const { hour, minute, second, millisecond } = DateTime.fromISO(
      content.StartTime,
      { zone: api.timeZone }
    )
    const startsAt = DateTime.fromObject(
      { year, month, day, hour, minute, second, millisecond },
      { zone: api.timeZone }
    )
    return startsAt
  }

  /** Return timestamps shared between event types. */
  timestamps(content: BaseEventContent) {
    const startsAt = this.getEventStart(content)
    return {
      fetchedAt: Timestamp.now(),
      startsAt: Timestamp.fromMillis(startsAt.toMillis())
    }
  }
}

class SpecialEventsScraper extends EventScraper<
  SpecialEventContent,
  SpecialEvent
> {
  constructor() {
    super("every 60 minutes", 120)
  }

  async listEvents() {
    const events = await api.getSpecialEvents()
    return events.filter(SpecialEventContent.guard)
  }

  getEvent(content: SpecialEventContent) {
    const event: SpecialEvent = {
      id: `specialEvent-${content.EventId}`,
      type: "specialEvent",
      content,
      ...this.timestamps(content)
    }
    return Promise.resolve(event)
  }
}

class SessionScraper extends EventScraper<SessionContent, Session> {
  private court = currentGeneralCourt

  constructor() {
    super("every 60 minutes", 120)
  }

  async listEvents() {
    const events = await api.getSessions(this.court)
    return events.filter(SessionContent.guard)
  }

  getEvent(content: SessionContent) {
    const event: Session = {
      id: `session-${this.court}-${content.EventId}`,
      type: "session",
      content,
      ...this.timestamps(content)
    }
    return Promise.resolve(event)
  }
}

class HearingScraper extends EventScraper<HearingListItem, Hearing> {
  constructor() {
    super("every 60 minutes", 240)
  }

  async listEvents() {
    const events = await api.listHearings()
    return events.filter(HearingListItem.guard)
  }

  async getEvent({ EventId }: HearingListItem /* e.g. 4962 */) {
    const data = await api.getHearing(EventId)
    const content = HearingContent.check(data)
    const eventInDb = await db
      .collection("events")
      .doc(`hearing-${String(EventId)}`)
      .get()
    const eventData = eventInDb.data()
    const hearing = Hearing.check(eventData)
    const shouldScrape = withinCutoff(hearing.startsAt.toDate())

    let maybeVideoURL = null
    let transcript = null
    if (!hearing.videoFetchedAt && shouldScrape) {
      const req = await fetch(
        `https://malegislature.gov/Events/Hearings/Detail/${EventId}`
      )
      const res = await req.text()
      if (res) {
        const dom = new JSDOM(res)
        if (dom) {
          const maybeVideoSource =
            dom.window.document.querySelectorAll("video source")
          if (maybeVideoSource.length && maybeVideoSource[0]) {
            const newToken = randomBytes(16).toString("hex")
            const firstVideoSource = maybeVideoSource[0] as HTMLSourceElement
            maybeVideoURL = firstVideoSource.src

            transcript = await assembly.transcripts.submit({
              webhook_url:
                process.env.NODE_ENV === "development"
                  ? "https://us-central1-digital-testimony-dev.cloudfunctions.net/transcription"
                  : "https://us-central1-digital-testimony-prod.cloudfunctions.net/transcription",
              webhook_auth_header_name: "X-Maple-Webhook",
              webhook_auth_header_value: newToken,
              audio: firstVideoSource.src,
              auto_highlights: true,
              custom_topics: true,
              entity_detection: true,
              iab_categories: false,
              format_text: true,
              punctuate: true,
              speaker_labels: true,
              summarization: true,
              summary_model: "informative",
              summary_type: "bullets"
            })

            await db
              .collection("events")
              .doc(`hearing-${String(EventId)}`)
              .collection("private")
              .doc("webhookAuth")
              .set({
                videoAssemblyWebhookToken: sha256(newToken)
              })
          }
        }
      }
    }
    const event: Hearing = {
      id: `hearing-${EventId}`,
      type: "hearing",
      content,
      videoURL: maybeVideoURL ? maybeVideoURL : undefined,
      videoFetchedAt: maybeVideoURL ? Timestamp.now() : undefined,
      videoAssemblyId: transcript ? transcript.id : undefined,
      ...this.timestamps(content)
    }
    return event
  }
}

export const scrapeSpecialEvents = new SpecialEventsScraper().function
export const scrapeSessions = new SessionScraper().function
export const scrapeHearings = new HearingScraper().function
