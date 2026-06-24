import { addDays, subDays } from "date-fns"
import { isValidVideoUrl, withinCutoff, removeCommonWords } from "./helpers"

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

describe("removeCommonWords", () => {
  it("should remove a common prefix from all strings", () => {
    const result = removeCommonWords(["hello there", "hello you"])
    expect(result).toEqual(["there", "you"])
  })

  it("should remove a common suffix from all strings", () => {
    const result = removeCommonWords([
      "9/21 Public Speech",
      "2/15 Public Speech",
      "3/25 Public Speech"
    ])
    expect(result).toEqual(["9/21", "2/15", "3/25"])
  })

  it("should remove both a common prefix and suffix", () => {
    const result = removeCommonWords([
      "There is a mouse in my house",
      "There is a cat in my house"
    ])
    expect(result).toEqual(["mouse", "cat"])
  })

  it("should not remove partial word matches", () => {
    const result = removeCommonWords(["thingdot", "thingbot"])
    expect(result).toEqual(["thingdot", "thingbot"])
  })

  it("should preserve multiple words", () => {
    const result = removeCommonWords([
      "meeting notes draft",
      "project plan draft",
      "design review draft"
    ])
    expect(result).toEqual(["meeting notes", "project plan", "design review"])
  })

  it("should not remove multiple of the same word", () => {
    const result = removeCommonWords(["a x c", "a y c", "a c c"])
    expect(result).toEqual(["x", "y", "c"])
  })

  it("should leave strings unchanged when there are no common words", () => {
    const result = removeCommonWords([
      "apple banana",
      "orange pear",
      "grape melon"
    ])
    expect(result).toEqual(["apple banana", "orange pear", "grape melon"])
  })

  it("should return empty strings when all words are common", () => {
    const result = removeCommonWords(["same words", "same words"])
    expect(result).toEqual(["", ""])
  })

  it("should handle empty strings", () => {
    const result = removeCommonWords(["", ""])
    expect(result).toEqual(["", ""])
  })

  it("should handle mixtures of empty and non-empty strings", () => {
    const result = removeCommonWords(["", "hello world"])
    expect(result).toEqual(["", "hello world"])
  })

  it("should handle alternate forms of whitespace", () => {
    const result = removeCommonWords([
      "a b c b e f",
      "a  b c i\n e\nf",
      "a\n\rb\n\rc\n\rr\n\re\n\rf",
      "a\tb \t c         b e\tf"
    ])
    expect(result).toEqual(["b", "i", "r", "b"])
  })

  it("should handle alternate case", () => {
    const result = removeCommonWords(["A b c", "a B c", "a b c", "A r f"])
    expect(result).toEqual(["b c", "B c", "b c", "r f"])
  })
})
