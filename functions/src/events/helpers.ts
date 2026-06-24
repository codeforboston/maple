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

export function removeCommonWords(strings: string[]) {
  if (!strings.length) return []

  // Normalize whitespace and split into words
  const wordLists = strings.map(s => s.trim().replace(/\s+/g, " ").split(" "))

  let prefixLen = 0
  while (
    wordLists.every(
      words =>
        prefixLen < words.length &&
        words[prefixLen].toLowerCase() === wordLists[0][prefixLen].toLowerCase()
    )
  ) {
    prefixLen++
  }

  let suffixLen = 0
  while (
    wordLists.every(
      words =>
        suffixLen < words.length - prefixLen &&
        words[words.length - 1 - suffixLen].toLowerCase() ===
          wordLists[0][wordLists[0].length - 1 - suffixLen].toLowerCase()
    )
  ) {
    suffixLen++
  }

  return wordLists.map(words =>
    words.slice(prefixLen, words.length - suffixLen).join(" ")
  )
}
