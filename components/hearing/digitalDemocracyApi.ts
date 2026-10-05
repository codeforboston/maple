const API_KEY = process.env.DIGITAL_DEMOCRACY_API_KEY ?? ""

const BASE_URL = "https://api.digitaldemocracy.org"

export type DDHearingVideo = {
  file_id: string
  uid: number
  video_url: string
  // Not present on all responses; falls back to `uid` ordering when absent.
  start_time?: number
}

export type DDHearing = {
  hid: number
  title: string
  date: string
  session_year: string
  state: string
  hearing_video_thumbnail: string | null
  hearing_videos: DDHearingVideo[]
}

type DDHearingResponse = {
  data: {
    hearing: DDHearing
    agenda: unknown[]
  }
}

export type DDUtterance = {
  content: string
  first: string | null
  last: string | null
  party: string | null
  person_type: string
  pid: number | null
  hid: number
  uid: number
  file_id: string
  // Offset in seconds from the start of the video identified by `file_id`.
  timestamp: number
  date: number
}

type DDUtterancesResponse = {
  data: {
    utterances: DDUtterance[]
  }
  page: number
  per_page: number
  total_pages: number
  total_results: number
}

function headers() {
  return { "x-api-key": API_KEY }
}

export async function fetchDDHearing(
  hid: string | number
): Promise<DDHearing | null> {
  const res = await fetch(`${BASE_URL}/legacy/ma/hearing/${hid}`, {
    headers: headers()
  })
  if (!res.ok) return null

  const body: DDHearingResponse = await res.json()
  return body.data?.hearing ?? null
}

export async function fetchDDUtterances(
  hid: string | number
): Promise<DDUtterance[]> {
  const res = await fetch(
    `${BASE_URL}/legacy/ma/elasticsearch/utterances?hid=${hid}&per_page=500`,
    { headers: headers() }
  )
  if (!res.ok) return []

  const body: DDUtterancesResponse = await res.json()
  const utterances = body.data?.utterances ?? []
  // `date` is an absolute epoch timestamp, unlike `timestamp` which resets
  // per video, so it's the only reliable way to sort across multiple videos.
  return [...utterances].sort((a, b) => a.date - b.date)
}

export function speakerName(utterance: DDUtterance): string | null {
  const { first, last } = utterance
  if (!first && !last) return null
  return [first, last].filter(Boolean).join(" ")
}
