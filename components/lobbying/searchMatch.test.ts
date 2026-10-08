import { matchesSearch } from "./searchMatch"

describe("matchesSearch", () => {
  it("matches a full-name query against a name with a middle initial", () => {
    // The exact bug report: "john griffin" must match "John A Griffin" even
    // though "griffin" doesn't immediately follow "john " in the string.
    expect(matchesSearch("John A Griffin", "john griffin")).toBe(true)
  })

  it("matches a single word substring", () => {
    expect(matchesSearch("John A Griffin", "griffin")).toBe(true)
  })

  it("matches a trailing two-word substring", () => {
    expect(matchesSearch("John A Griffin", "a griffin")).toBe(true)
  })

  it("matches the full name exactly", () => {
    expect(matchesSearch("John A Griffin", "john a griffin")).toBe(true)
  })

  it("is case-insensitive", () => {
    expect(matchesSearch("John A Griffin", "JOHN GRIFFIN")).toBe(true)
  })

  it("matches words out of order", () => {
    expect(matchesSearch("John A Griffin", "griffin john")).toBe(true)
  })

  it("does not match a word that isn't present at all", () => {
    expect(matchesSearch("John A Griffin", "john smith")).toBe(false)
  })

  it("treats an empty or whitespace-only query as matching everything", () => {
    expect(matchesSearch("John A Griffin", "")).toBe(true)
    expect(matchesSearch("John A Griffin", "   ")).toBe(true)
  })

  it("collapses extra whitespace between words", () => {
    expect(matchesSearch("John A Griffin", "john    griffin")).toBe(true)
  })
})
