import { JSDOM } from "jsdom"
import { db, Timestamp } from "../firebase"
import * as api from "../malegislature"
import { Hearing, HearingContent, HearingListItem, Video } from "./types"
import { isValidVideoUrl } from "./helpers"
import { Committee } from "../committees/types"
import { EventPostProcessor, EventScraper } from "./EventScraper"
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
    super("every 60 minutes", 480)
  }

  async listEvents() {
    const events = await api.listHearings()
    return events.filter(HearingListItem.guard)
  }

  async getEvent({ EventId }: HearingListItem /* e.g. 4962 */) {
    const data = await api.getHearing(EventId)
    const content = HearingContent.check(data)

    console.log("content in getEvent()", content)

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
      videos: [],
      transcriptionIds: [],
      ...this.timestamps(content)
    } as Hearing
  }
}

function removeCommonWords(strings: string[]) {
  if (!strings.length) return [];

  // Normalize whitespace and split into words
  const wordLists = strings.map(s =>
    s.trim().replace(/\s+/g, " ").split(" ")
  );

  let prefixLen = 0;
  while (
    wordLists.every(words =>
      prefixLen < words.length &&
      words[prefixLen].toLowerCase() ===
        wordLists[0][prefixLen].toLowerCase()
    )
  ) {
    prefixLen++;
  }

  let suffixLen = 0;
  while (
    wordLists.every(words =>
      suffixLen < words.length - prefixLen &&
      words[words.length - 1 - suffixLen].toLowerCase() ===
        wordLists[0][wordLists[0].length - 1 - suffixLen].toLowerCase()
    )
  ) {
    suffixLen++;
  }

  return wordLists.map(words =>
    words
      .slice(prefixLen, words.length - suffixLen)
      .join(" ")
  );
}

export class HearingPostProcessor extends EventPostProcessor<HearingListItem> {
  constructor() {
    super("every 60 minutes", 480, "hearing", { memory: "4GB" })
  }

  async getHearingVideos(
    EventId: number
  ): Promise<Omit<Video, "transcriptionId">[]> {
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
        title: titles[i]
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
          shortTitles = shortTitles.map((_, i) => `Part ${i+1}`)
        }
        videos = videos.map((item, index) => {
          item.title = shortTitles[index]
          return item
        })
        console.log(`Ordering not possible for hearing ${EventId} - fallback titles are ${JSON.stringify(shortTitles)}`)
      }
    } else {
      videos[0].title = `hearing-${EventId}`
    }
    return videos
  }

  updateIf(data: FirebaseFirestore.DocumentData): null | HearingListItem {
    if (data.videos.length) return null
    return { EventId: data.content.EventId }
  }

  async getUpdate({ EventId }: HearingListItem, existingVideos?: Video[]): Promise<{
    transcriptionIds: string[]
    videos: Video[]
    videosFetchedAt: Timestamp
  }> {
    const videos = await this.getHearingVideos(EventId)

    const prevURLs = existingVideos ?
      Object.fromEntries(existingVideos.map(({ url, transcriptionId }) => 
        [url, transcriptionId]
      )) : {}

    const transcriptionIds = await Promise.all(
      videos.map(item => {
        return prevURLs[item.url] !== undefined ? prevURLs[item.url] : assemblyAI().submitTranscription({
          EventId, videoUrl: item.url
        })
      })
    )

    const videosWithTranscriptions = videos.map((item, index) => {
      return {
        transcriptionId: transcriptionIds[index],
        ...item
      }
    })

    return {
      transcriptionIds,
      videos: videosWithTranscriptions,
      videosFetchedAt: Timestamp.now()
    }
  }
}
