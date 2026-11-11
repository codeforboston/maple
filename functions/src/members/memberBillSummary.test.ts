import {
  buildMemberBillSummary,
  MemberBillSummaryInput
} from "./memberBillSummary"

const makeBill = (
  id: string,
  primaryTopic?: string,
  subtopic?: string
): MemberBillSummaryInput => ({
  id,
  content: { Title: `Title ${id}` },
  topics: [primaryTopic, subtopic]
    .filter((topic): topic is string => !!topic)
    .map(topic => ({ topic }))
})

describe("buildMemberBillSummary", () => {
  it("groups unique existing bills and sorts recent sponsored bills by numeric bill ID", () => {
    const sponsoredIds = [
      "HD9",
      "HD10",
      "HD11",
      "HD12",
      "HD13",
      "HD14",
      "HD10",
      "HD99"
    ]
    const cosponsoredIds = ["HD10", "HD15", "HD16"]
    const bills = [
      makeBill("HD9", "Education", "K-12"),
      makeBill("HD10", "Education", "Higher education"),
      makeBill("HD11", "Education", "K-12"),
      makeBill("HD12", "Healthcare", "Mental health"),
      makeBill("HD13", "Education", "Higher education"),
      makeBill("HD14", "Education", "K-12"),
      makeBill("HD15", "Healthcare", "Mental health"),
      makeBill("HD16", "Government", "Voting")
    ]

    const summary = buildMemberBillSummary(sponsoredIds, cosponsoredIds, bills)

    expect(summary.all.count).toBe(8)
    expect(summary.sponsored.count).toBe(6)
    expect(summary.cosponsored.count).toBe(2)
    expect(summary.recentSponsoredBills).toEqual([
      { id: "HD14", title: "Title HD14", topic: "K-12" },
      { id: "HD13", title: "Title HD13", topic: "Higher education" },
      { id: "HD12", title: "Title HD12", topic: "Mental health" },
      { id: "HD11", title: "Title HD11", topic: "K-12" },
      { id: "HD10", title: "Title HD10", topic: "Higher education" }
    ])
    expect(summary.all.topics).toEqual([
      {
        topic: "Education",
        count: 5,
        subtopics: [
          { topic: "K-12", count: 3 },
          { topic: "Higher education", count: 2 }
        ]
      },
      {
        topic: "Healthcare",
        count: 2,
        subtopics: [{ topic: "Mental health", count: 2 }]
      },
      {
        topic: "Government",
        count: 1,
        subtopics: [{ topic: "Voting", count: 1 }]
      }
    ])
  })
})
