import { targetOf } from "./target"

const ids = { court: 194, billId: "S2581" }

describe("targetOf", () => {
  it("targets the bill when no other target is named", () => {
    const target = targetOf({ ...ids, ballotQuestionId: null })
    expect(target.kind).toBe("bill")
    expect(target.ref.path).toBe("generalCourts/194/bills/S2581")
  })

  it("targets a ballot question", () => {
    const target = targetOf({ ...ids, ballotQuestionId: "bq-1" })
    expect(target.kind).toBe("ballotQuestion")
    expect(target.ref.path).toBe("ballotQuestions/bq-1")
  })

  it("targets a conference", () => {
    const target = targetOf({ ...ids, conferenceId: "data-privacy" })
    expect(target.kind).toBe("conference")
    expect(target.ref.path).toBe("generalCourts/194/conferences/data-privacy")
  })

  it("throws on a testimony naming two targets", () => {
    expect(() =>
      targetOf({ ...ids, ballotQuestionId: "bq-1", conferenceId: "x" })
    ).toThrow("Testimony targets a ballot question or a conference, not both")
  })
})
