import { addDays, subDays } from "date-fns"
import { isValidVideoUrl, withinCutoff } from "./helpers"

describe("withinCutoff true", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("should return true for a date within three days", () => {
    const now = new Date()

    const threeDaysAgo = subDays(now, 3)

    const result = withinCutoff(threeDaysAgo)
    expect(result).toEqual(true)
  })

  it("should return false for a date that is 9 days ago", () => {
    const now = new Date()

    const threeDaysAgo = subDays(now, 9)

    const result = withinCutoff(threeDaysAgo)
    expect(result).toEqual(false)
  })

  it("should return false for a date that is 2 days in the future", () => {
    const now = new Date()

    const threeDaysAgo = addDays(now, 2)

    const result = withinCutoff(threeDaysAgo)
    expect(result).toEqual(false)
  })
})

describe("isValidVideoUrl", () => {
  it("should return true for a valid video URL", () => {
    const validUrl = "https://example.com/video.mp4"
    const result = isValidVideoUrl(validUrl)
    expect(result).toEqual(true)
  })

  it("should return false for a missing URL", () => {
    const result = isValidVideoUrl(null)
    expect(result).toEqual(false)
  })

  it("should return false for a URL with no file format", () => {
    const result = isValidVideoUrl("https://example.com/video")
    expect(result).toEqual(false)
  })

  it("should return false for a URL with an unsupported format", () => {
    const result = isValidVideoUrl("https://example.com/video.m3u8")
    expect(result).toEqual(false)
  })
})
