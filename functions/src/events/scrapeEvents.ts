import { RuntimeOptions, runWith } from "firebase-functions"
import { DateTime } from "luxon"
import { JSDOM } from "jsdom"
import { AssemblyAI } from "assemblyai"
import { logFetchError } from "../common"
import { db, storage, Timestamp } from "../firebase"
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
import { isValidVideoUrl, withinCutoff } from "./helpers"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
abstract class EventScraper<ListItem, Event extends BaseEvent> {
  private schedule
  private timeout
  private memory

  constructor(
    schedule: string,
    timeout: number,
    memory: RuntimeOptions["memory"] = "256MB"
  ) {
    this.schedule = schedule
    this.timeout = timeout
    this.memory = memory
  }

  get function() {
    return runWith({
      timeoutSeconds: this.timeout,
      secrets: ["ASSEMBLY_API_KEY"],
      memory: this.memory
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
    const upcomingOrRecentCutoff = DateTime.now().minus({ days: 8 })

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

class SpecialEventsScraper extends EventScraper<
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

const extractAudioFromVideo = async (
  EventId: number,
  videoUrl: string
): Promise<string> => {
  const tmpFilePath = `/tmp/hearing-${EventId}-${Date.now()}.m4a`

  // Stream directly from URL and copy audio codec
  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoUrl)
      .noVideo()
      .audioCodec("copy")
      .format("mp4")
      .on("start", commandLine => {
        console.log(`Spawned FFmpeg with command: ${commandLine}`)
      })
      .on("progress", progress => {
        if (
          progress &&
          progress.percent &&
          Math.round(progress.percent) % 10 === 0
        ) {
          console.log(`Processing: ${progress.percent}% done`)
        }
      })
      .on("end", () => {
        console.log("FFmpeg processing finished successfully")
        resolve()
      })
      .on("error", err => {
        console.error("FFmpeg error:", err)
        reject(err)
      })
      .save(tmpFilePath)
  })

  // Upload the audio file
  const bucket = storage.bucket()
  const audioFileName = `hearing-${EventId}-${Date.now()}.m4a`
  const file = bucket.file(audioFileName)

  const fileContent = await fs.promises.readFile(tmpFilePath)
  await file.save(fileContent, {
    metadata: {
      contentType: "audio/mp4"
    }
  })

  // Clean up temporary file
  await fs.promises.unlink(tmpFilePath)

  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 24 * 60 * 60 * 1000
  })

  // Delete old files
  const [files] = await bucket.getFiles({
    prefix: "hearing-",
    maxResults: 1000
  })
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
  const oldFiles = files.filter(file => {
    const timestamp = parseInt(file.name.split("-").pop()?.split(".")[0] || "0")
    return timestamp < oneDayAgo
  })
  await Promise.all(oldFiles.map(file => file.delete()))

  // Return the new audio url
  return url
}

const submitTranscription = async ({
  EventId,
  maybeVideoUrl
}: {
  EventId: number
  maybeVideoUrl: string
}) => {
  const assembly = new AssemblyAI({
    apiKey: process.env.ASSEMBLY_API_KEY ? process.env.ASSEMBLY_API_KEY : ""
  })

  const newToken = randomBytes(16).toString("hex")
  const audioUrl = await extractAudioFromVideo(EventId, maybeVideoUrl)

  const transcript = await assembly.transcripts.submit({
    audio:
      // test with: "https://assemblyaiusercontent.com/playground/aKUqpEtmYmI.flac",
      audioUrl,
    webhook_url:
      // make sure process.env.FUNCTIONS_API_BASE equals
      // https://us-central1-digital-testimony-prod.cloudfunctions.net
      // on prod. test with:
      // "https://ngrokid.ngrok-free.app/demo-dtp/us-central1/transcription",
      `${process.env.FUNCTIONS_API_BASE}/transcription`,
    speaker_labels: true,
    webhook_auth_header_name: "x-maple-webhook",
    webhook_auth_header_value: newToken
  })

  await db
    .collection("events")
    .doc(`hearing-${String(EventId)}`)
    .collection("private")
    .doc("webhookAuth")
    .set({
      videoAssemblyWebhookToken: sha256(newToken)
    })

  return transcript.id
}

const getHearingVideoUrl = async (EventId: number) => {
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
        const firstVideoSource = maybeVideoSource[0] as HTMLSourceElement
        const maybeVideoUrl = firstVideoSource.src

        return isValidVideoUrl(maybeVideoUrl) ? maybeVideoUrl : null
      }
    }
  }
  return null
}

const shouldScrapeVideo = async (EventId: number) => {
  const eventInDb = await db
    .collection("events")
    .doc(`hearing-${String(EventId)}`)
    .get()
  const eventData = eventInDb.data()

  console.log("eventData in shouldScrapeVideo()", eventData)

  if (!eventData) {
    return false
  }
  if (!eventData.videoURL) {
    return withinCutoff(new Date(Hearing.check(eventData).startsAt.toDate()))
  }
  return false
}

class HearingScraper extends EventScraper<HearingListItem, Hearing> {
  constructor() {
    super("every 60 minutes", 480, "4GB")
  }

  async listEvents() {
    const events = await api.listHearings()
    return events.filter(HearingListItem.guard)
  }

  async getEvent({ EventId }: HearingListItem /* e.g. 4962 */) {
    const data = await api.getHearing(EventId)
    const content = HearingContent.check(data)

    console.log("content in getEvent()", content)

    if (await shouldScrapeVideo(EventId)) {
      try {
        const maybeVideoUrl = await getHearingVideoUrl(EventId)
        if (maybeVideoUrl) {
          const transcriptId = await submitTranscription({
            maybeVideoUrl,
            EventId
          })

          // Immediately save video info to prevent reprocessing
          // since the bulkWriter does not save the video properties
          // returned from this method.
          await db.collection("events").doc(`hearing-${EventId}`).update({
            videoURL: maybeVideoUrl,
            videoFetchedAt: Timestamp.now(),
            videoTranscriptionId: transcriptId
          })

          return {
            id: `hearing-${EventId}`,
            type: "hearing",
            content,
            ...this.timestamps(content),
            videoURL: maybeVideoUrl,
            videoFetchedAt: Timestamp.now(),
            videoTranscriptionId: transcriptId // using the assembly Id as our transcriptionId
          } as Hearing
        }
      } catch (error) {
        console.error(`Failed to process audio for hearing ${EventId}:`, error)
        return {
          id: `hearing-${EventId}`,
          type: "hearing",
          content,
          ...this.timestamps(content)
        } as Hearing
      }
    }
    return {
      id: `hearing-${EventId}`,
      type: "hearing",
      content,
      ...this.timestamps(content)
    } as Hearing
  }
}

export const scrapeSpecialEvents = new SpecialEventsScraper().function
export const scrapeSessions = new SessionScraper().function
export const scrapeHearings = new HearingScraper().function
