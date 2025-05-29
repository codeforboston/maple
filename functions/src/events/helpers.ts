import { isAfter, subDays } from "date-fns"

const VIDEO_FORMAT_ALLOWLIST = ["mp4"]

export const withinCutoff = (date: Date) => {
  const now = new Date()
  const cutoff = subDays(now, 8)

  return isAfter(date, cutoff) && !isAfter(date, now)
}

// This isn't perfect because it relies on the file extension,
// but it's a reasonable heuristic for now and should differentiate
// the livestreams we don't want from the archived video we do want.
export const isValidVideoUrl = (url: string | null | undefined) => {
  if (!url) return false

  const fileFormat = url.split(".").pop()?.toLowerCase()
  if (!fileFormat) {
    console.log(`Could not find file format for video URL: {url}`)
    return false
  } else if (!VIDEO_FORMAT_ALLOWLIST.includes(fileFormat)) {
    console.log(
      `Url ${url} has unsupported video format: ${fileFormat}. Supported formats: ${VIDEO_FORMAT_ALLOWLIST.join(
        ", "
      )}`
    )
    return false
  }

  return true
}
