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
  topics: [
    primaryTopic
      ? { category: primaryTopic, topic: subtopic ?? "" }
      : undefined,
    subtopic ? { category: primaryTopic ?? "", topic: subtopic } : undefined
  ].filter(
    (topic): topic is { category: string; topic: string } =>
      topic !== undefined && topic.category !== ""
  )
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
    expect(summary.schemaVersion).toBe(2)
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

  it("counts each bill once per category and each category-topic pair once", () => {
    const summary = buildMemberBillSummary(
      ["HD1", "HD2"],
      [],
      [
        {
          id: "HD1",
          content: { Title: "First" },
          topics: [
            { category: "Health", topic: "Care" },
            { category: "Health", topic: "Care" },
            { category: "Housing", topic: "Rent" }
          ]
        },
        {
          id: "HD2",
          content: { Title: "Second" },
          topics: [{ category: "Health", topic: "Care" }]
        }
      ]
    )

    expect(summary.all.topics).toEqual([
      { topic: "Health", count: 2, subtopics: [{ topic: "Care", count: 2 }] },
      { topic: "Housing", count: 1, subtopics: [{ topic: "Rent", count: 1 }] }
    ])
  })
})
