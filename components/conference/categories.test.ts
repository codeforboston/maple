import { categoryOf } from "./categories"
import { ConferenceSummary } from "./types"

const conference = (more: Partial<ConferenceSummary>): ConferenceSummary => ({
  id: "c",
  court: 194,
  name: "c",
  title: "c",
  senateBillId: "S1",
  houseBillId: "H1",
  canonicalBillId: "S1",
  status: "appointed",
  covered: true,
  reportBillId: null,
  confereeCounts: { senate: 3, house: 3 },
  analysisUpdatedAt: null,
  ...more
})

describe("categoryOf", () => {
  it.each([
    ["appointed and covered", {}, "active"],
    ["appointed and not covered", { covered: false }, "notCovered"],
    [
      "report filed, with its report bill",
      { status: "reportFiled", reportBillId: "H5" },
      "pending"
    ],
    [
      "report filed, not covered, with its report bill",
      { status: "reportFiled", reportBillId: "H5", covered: false },
      "pending"
    ],
    [
      "enacted, with its report bill",
      { status: "enacted", reportBillId: "H5" },
      "enacted"
    ],
    [
      "dissolved, with a report bill",
      { status: "dissolved", reportBillId: "H5" },
      "failed"
    ],
    ["dissolved, with no report bill", { status: "dissolved" }, "dissolved"],
    ["report filed, with no report bill", { status: "reportFiled" }, undefined],
    ["enacted, with no report bill", { status: "enacted" }, undefined]
  ] as const)("%s", (_, more, expected) => {
    expect(categoryOf(conference(more))).toBe(expected)
  })
})
