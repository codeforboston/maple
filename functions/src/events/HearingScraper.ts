import { JSDOM } from "jsdom"
import * as functions from "firebase-functions/v1"
import { db, Timestamp } from "../firebase"
import { DateTime } from "luxon"
import * as api from "../malegislature"
import { Hearing, HearingContent, HearingListItem, Video } from "./types"
import { isValidVideoUrl, removeCommonWords } from "./helpers"
import { Committee } from "../committees/types"
import { EventScraper } from "./EventScraper"
import { assemblyAI } from "./AssemblyAIHandler"

const loadCommitteeChairNames = async (
  generalCourtNumber: number,
  committeeCode: string
) => {
  try {
    const committeeSnap = await db
      .collection(`generalCourts/${generalCourtNumber}/committees`)
      .doc(committeeCode)
      .get()

    if (!committeeSnap.exists) return [] as string[]

    const { members, content } = Committee.check(committeeSnap.data())
    const chairCodes = new Set<string>()
    const maybeHouse = content.HouseChairperson?.MemberCode
    const maybeSenate = content.SenateChairperson?.MemberCode

    if (maybeHouse) chairCodes.add(maybeHouse)
    if (maybeSenate) chairCodes.add(maybeSenate)
    return (members ?? [])
      .filter(member => chairCodes.has(member.id))
      .map(member => member.name)
  } catch (error) {
    console.warn(
      `Failed to load committee chairs for ${committeeCode} (${generalCourtNumber}):`,
      error
    )
    return [] as string[]
  }
}

export class HearingScraper extends EventScraper<HearingListItem, Hearing> {
  constructor() {
    super("every 60 minutes", 120)
  }

  async listEvents() {
    const events = await api.listHearings()
    return events.filter(HearingListItem.guard)
  }

  async getEvent({ EventId }: HearingListItem /* e.g. 4962 */) {
    const data = await api.getHearing(EventId)
    const content = HearingContent.check(data)

    const host = content.HearingHost
    const committeeChairs =
      host?.CommitteeCode && host?.GeneralCourtNumber
        ? await loadCommitteeChairNames(
            host.GeneralCourtNumber,
            host.CommitteeCode
          )
        : []

    return {
      id: `hearing-${EventId}`,
      type: "hearing",
      content,
      committeeChairs,
      ...this.timestamps(content)
    } as Hearing
  }
}

export class HearingPostProcessor {
  private schedule
  private timeout
  private memory
  private pastEventBeginProcessing
  private pastEventCutoff

  constructor(
    schedule: string = "every 60 minutes",
    timeout: number = 540,
    {
      memory = "4GB",
      pastEventBeginProcessing = {},
      pastEventCutoff = { days: 8 }
    }: {
      memory?: functions.RuntimeOptions["memory"]
      pastEventBeginProcessing?: Duration
      pastEventCutoff?: Duration
    } = {}
  ) {
    this.schedule = schedule
    this.timeout = timeout
    this.memory = memory
    this.pastEventBeginProcessing = pastEventBeginProcessing
    this.pastEventCutoff = pastEventCutoff
  }

  get function() {
    return functions
      .runWith({
        timeoutSeconds: this.timeout,
        secrets: ["ASSEMBLY_API_KEY"],
        memory: this.memory,
        maxInstances: 1
      })
      .pubsub.schedule(this.schedule)
      .onRun(() => this.run())
  }

  private async run() {
    const now = DateTime.now()
    const begin = now.minus(this.pastEventBeginProcessing).toJSDate()
    const cutoff = now.minus(this.pastEventCutoff).toJSDate()

    const snapshot = await db
      .collection("events")
      .where("type", "==", "hearing")
      .where("startsAt", "<=", begin)
      .where("startsAt", ">=", cutoff)
      .get()

    if (snapshot.empty) return

    for (const doc of snapshot.docs) {
      const changed = await this.addVideosToHearing(doc, { limit: 1 })
      if (changed) return
    }
  }

  async addVideosToHearing(
    doc:
      | FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
      | FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>,
    {
      limit,
      refetch = false
    }: {
      limit?: number
      refetch?: boolean
    }
  ): Promise<boolean> {
    let count = 0
    const data = doc.data()
    const eventId = data?.content?.EventId
    if (!data || !eventId) return false
    let videos: Video[]
    if (!data.videos) {
      videos = await this.getHearingVideos(eventId)
      // We need to retry until videos become available (if ever)
      if (videos.length === 0) return false
      console.log(`Adding ${videos.length} videos to ${eventId}`)
      await doc.ref.update({
        videos,
        transcriptionIds: this.transcriptionIds(videos),
        videosFetchedAt: Timestamp.now()
      })
    } else if (refetch) {
      const oldVideos = data.videos
      videos = await this.getHearingVideos(eventId)
      if (videos.length === 0) return false
      for (const oldVideo of oldVideos) {
        if (!oldVideo.transcriptionId) continue
        const index = videos.findIndex(video => video.url === oldVideo.url)
        if (index < 0) {
          functions.logger.error(
            `A refetch of hearing ${eventId} somehow lost a video ${oldVideo.url}`
          )
          videos.push(oldVideo)
        } else {
          videos[index].transcriptionId = oldVideo.transcriptionId
        }
      }
      console.log(`Refetching ${videos.length} videos to ${eventId}`)
      await doc.ref.update({
        videos,
        transcriptionIds: this.transcriptionIds(videos),
        videosFetchedAt: Timestamp.now()
      })
    } else {
      videos = data.videos
    }

    let nextVideos = await this.submitNextTranscription(eventId, videos)
    count += 1
    if (!nextVideos) return false
    while (nextVideos) {
      await doc.ref.update({
        videos: nextVideos,
        transcriptionIds: this.transcriptionIds(nextVideos)
      })
      if (limit && count >= limit) {
        return true
      }
      nextVideos = await this.submitNextTranscription(eventId, nextVideos)
      count += 1
    }
    return true
  }

  async submitNextTranscription(
    eventId: number,
    videos: Video[]
  ): Promise<Video[] | null> {
    const nextTranscription = videos.findIndex(item => !item.transcriptionId)
    if (nextTranscription < 0) {
      return null
    }
    const result = await assemblyAI().submitTranscription({
      EventId: eventId,
      videoUrl: videos[nextTranscription].url
    })
    if (result.status === ("error" as const)) {
      functions.logger.error(`Error during ${result.type}: ${result.error}`)
      return null
    }
    console.log(
      `Adding new transcription to ${eventId}: ${videos[nextTranscription].url} with id ${result.id}`
    )
    videos[nextTranscription].transcriptionId = result.id
    return videos
  }

  transcriptionIds(videos: Video[]): string[] {
    return videos
      .map(video => video.transcriptionId)
      .filter((item): item is string => item !== null)
  }

  async getHearingVideos(EventId: number): Promise<Video[]> {
    const hearingErr = `An error collecting videos for hearing ${EventId} (webpage format changed?)`

    const req = await fetch(
      `https://malegislature.gov/Events/Hearings/Detail/${EventId}`
    )
    const res = await req.text()
    if (!res) throw new Error(`${hearingErr}: No response for request`)
    const dom = new JSDOM(res)
    if (!dom)
      throw new Error(`${hearingErr}: Could not create JSDOM of request`)

    const videoElements = [].slice.call(
      dom.window.document.querySelectorAll("#playWebcast")
    ) as Element[]
    if (videoElements.length === 0) return []
    const videoURLs = videoElements.map(elem => {
      const onclick = elem.getAttribute("onclick")
      if (!onclick) throw new Error(`${hearingErr}: No onclick in ${elem}`)
      const match = onclick.match(/switchVideo\('([^']+)'/)
      if (!match || match.length < 2)
        throw new Error(`${hearingErr}: Could not match switchVideo in ${elem}`)
      if (!isValidVideoUrl(match[1]))
        throw new Error(`${hearingErr}: ${match[1]} is not a valid video url`)
      return match[1]
    })
    const tbody = videoElements[0].closest("tbody")
    if (!tbody)
      throw new Error(
        `${hearingErr}: Could not find parent tbody of #playWebcast`
      )
    const titles = Array.from(tbody.querySelectorAll("tr")).map(tr => {
      const item = tr.querySelector("td")?.textContent?.trim()
      if (!item)
        throw new Error(`${hearingErr}: Could not locate title in ${tr}`)
      return item
    })
    if (titles.length !== videoURLs.length)
      throw new Error(
        `${hearingErr}: Number of video table rows did not equal number of #playWebcast elements`
      )

    let videos = videoURLs.map((url, i) => {
      return {
        url: url,
        title: titles[i],
        transcriptionId: null
      }
    })

    let seen = new Set()
    videos = videos.filter(item => {
      if (seen.has(item.url)) return false
      seen.add(item.url)
      return true
    })

    if (videos.length > 1) {
      const order = videos.map(item => {
        const title = item.title.toLowerCase()
        const match = title.match(
          /\b(?:(\d+)\s+of\s+\d+|part\s+(\d+)|pt\.?\s+(\d+))\b/
        )
        if (!match) return -1
        const part = parseInt(match[1] || match[2] || match[3], 10)
        return part - 1
      })
      seen.clear()
      let validOrder = true
      for (const n of order) {
        if (n < 0 || n >= order.length || seen.has(n)) {
          validOrder = false
          break
        }
        seen.add(n)
      }
      if (validOrder) {
        const reordered = new Array(videos.length)
        for (let i = 0; i < order.length; i++) {
          reordered[order[i]] = videos[i]
        }
        videos = reordered
        videos = videos.map((item, index) => {
          item.title = `Part ${index + 1}`
          return item
        })
      } else {
        let shortTitles = removeCommonWords(titles)
        if (shortTitles[0].length === 0) {
          shortTitles = shortTitles.map((_, i) => `Part ${i + 1}`)
        }
        videos = videos.map((item, index) => {
          item.title = shortTitles[index]
          return item
        })
        console.log(
          `Ordering not possible for hearing ${EventId} - fallback titles are ${JSON.stringify(
            shortTitles
          )}`
        )
      }
    } else {
      videos[0].title = `hearing-${EventId}`
    }
    return videos
  }
}
