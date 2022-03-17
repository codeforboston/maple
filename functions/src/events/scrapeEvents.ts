import { runWith } from "firebase-functions"
import { DateTime } from "luxon"
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
    const upcomingOrRecentCutoff = DateTime.now().minus({ days: 1 })

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
  private court = api.currentGeneralCourt

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

  async getEvent({ EventId }: HearingListItem) {
    const content = HearingContent.check(await api.getHearing(EventId))
    const event: Hearing = {
      id: `hearing-${content.EventId}`,
      type: "hearing",
      content,
      ...this.timestamps(content)
    }
    return event
  }
}

export const scrapeSpecialEvents = new SpecialEventsScraper().function
export const scrapeSessions = new SessionScraper().function
export const scrapeHearings = new HearingScraper().function
