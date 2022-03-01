import axios from "axios"
import { logger, runWith } from "firebase-functions"
import { DateTime } from "luxon"
import { db, Timestamp } from "../firebase"
import * as api from "../malegislature"
import {
  BaseEvent,
  BaseEventContent,
  Hearing,
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
    const list = await this.listEvents()
    const writer = db.bulkWriter()
    const upcomingOrRecentCutoff = DateTime.now().minus({ days: 1 })

    for (let item of list) {
      let event: Event
      try {
        event = await this.getEvent(item)
      } catch (e) {
        if (axios.isAxiosError(e)) {
          logger.warn(
            `Could not fetch event for item ${(item as any)?.EventId}: ${
              e.message
            }`
          )
          continue
        } else {
          throw e
        }
      }

      if (event.startsAt.toMillis() < upcomingOrRecentCutoff.toMillis()) break

      writer.set(db.doc(`/events/${event.id}`), event)
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
    super("every 60 minutes", 60)
  }

  listEvents() {
    return api.getSpecialEvents()
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
    super("every 60 minutes", 60)
  }

  listEvents() {
    return api.getSessions(this.court)
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

class HearingScraper extends EventScraper<api.HearingListItem, Hearing> {
  constructor() {
    super("every 60 minutes", 240)
  }

  listEvents() {
    return api.listHearings()
  }

  async getEvent({ EventId }: api.HearingListItem) {
    const content = await api.getHearing(EventId)
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
