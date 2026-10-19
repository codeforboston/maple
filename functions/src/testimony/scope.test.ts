import { matchesTestimonyScope } from "./scope"

describe("matchesTestimonyScope", () => {
  it("treats testimony with no target as bill testimony", () => {
    expect(matchesTestimonyScope({})).toBe(true)
    expect(matchesTestimonyScope({ ballotQuestionId: null })).toBe(true)
    expect(matchesTestimonyScope({ conferenceId: "x" })).toBe(false)
    expect(matchesTestimonyScope({ ballotQuestionId: "25-14" })).toBe(false)
  })

  it("matches a conference only by its id", () => {
    const scope = { conferenceId: "data-privacy" }
    expect(matchesTestimonyScope({ conferenceId: "data-privacy" }, scope)).toBe(
      true
    )
    expect(matchesTestimonyScope({ conferenceId: "other" }, scope)).toBe(false)
    expect(matchesTestimonyScope({ ballotQuestionId: null }, scope)).toBe(false)
  })

  it("matches a ballot question only by its id", () => {
    const scope = { ballotQuestionId: "25-14", conferenceId: null }
    expect(matchesTestimonyScope({ ballotQuestionId: "25-14" }, scope)).toBe(
      true
    )
    expect(matchesTestimonyScope({}, scope)).toBe(false)
  })
})
