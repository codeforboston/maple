import { RuntimeOptions, runWith } from "firebase-functions/v1"
import { DateTime } from "luxon"
import { logFetchError } from "../common"
import { db, Timestamp } from "../firebase"
import * as api from "../malegislature"
import {
  BaseEvent,
  BaseEventContent,
  Session,
  SessionContent,
  SpecialEvent,
  SpecialEventContent
} from "./types"
import { currentGeneralCourt } from "../shared"

export abstract class EventScraper<ListItem, Event extends BaseEvent> {
  private schedule
  private timeout
  private memory
  private pastEventCutoff

  constructor(
    schedule: string,
    timeout: number,
    {
      memory = "256MB",
      pastEventCutoff = { days: 8 }
    }: {
      memory?: RuntimeOptions["memory"]
      pastEventCutoff?: Duration
    } = {}
  ) {
    this.schedule = schedule
    this.timeout = timeout
    this.memory = memory
    this.pastEventCutoff = pastEventCutoff
  }

  get function() {
    return runWith({
      timeoutSeconds: this.timeout,
      secrets: ["ASSEMBLY_API_KEY"],
      memory: this.memory,
      maxInstances: 1
    })
      .pubsub.schedule(this.schedule)
      .onRun(() => this.run())
  }

  abstract listEvents(): Promise<ListItem[]>
  abstract getEvent(item: ListItem): Promise<Event>

  private async run() {
    const list = await this.listEvents().catch(logFetchError("event list"))

    if (!list) return

    const writer = db.bulkWriter()
    const upcomingOrRecentCutoff = DateTime.now().minus(this.pastEventCutoff)

    for (let item of list) {
      const id = (item as any)?.EventId,
        event = await this.getEvent(item).catch(logFetchError("event", id))

      if (!event) continue
      if (event.startsAt.toMillis() < upcomingOrRecentCutoff.toMillis()) break

      writer.set(db.doc(`/events/${event.id}`), event, { merge: true })

      console.log("event in run()", event)
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

export class SpecialEventsScraper extends EventScraper<
  SpecialEventContent,
  SpecialEvent
> {
  constructor() {
    super("every 60 minutes", 540)
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

export class SessionScraper extends EventScraper<SessionContent, Session> {
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
