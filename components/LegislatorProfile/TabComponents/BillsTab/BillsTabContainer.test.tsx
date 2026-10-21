import React from "react"
import { render, screen } from "@testing-library/react"
import { MemberContent } from "functions/src/members/types"
import { MemberBillSummary } from "functions/src/members/memberBillSummary"
import { BillsTabContainer } from "./BillsTabContainer"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

jest.mock("./Bills/BillsByTopic", () => ({
  BillsByTopic: ({
    billGroups
  }: {
    billGroups: Pick<MemberBillSummary, "all" | "sponsored" | "cosponsored">
  }) =>
    React.createElement(
      "div",
      { "data-testid": "topic-bill-groups" },
      JSON.stringify({
        all: billGroups.all.count,
        sponsored: billGroups.sponsored.count,
        cosponsored: billGroups.cosponsored.count
      })
    )
}))

jest.mock("./Bills/RecentBills", () => ({
  RecentBills: ({
    bills,
    totalCount
  }: {
    bills: { id: string }[]
    totalCount: number
  }) =>
    React.createElement(
      "div",
      { "data-testid": "recent-bills" },
      `${bills.map(bill => bill.id).join(",")}:${totalCount}`
    )
}))

jest.mock("./Committees/CommitteePositions", () => ({
  CommitteePositions: ({ member }: { member: { Name: string } }) =>
    React.createElement(
      "div",
      { "data-testid": "committee-member" },
      member.Name
    )
}))

describe("BillsTabContainer", () => {
  it("passes summary groups to topic view and the recent bill projection to the table", () => {
    const bills: MemberBillSummary = {
      all: { count: 2, topics: [] },
      sponsored: { count: 1, topics: [] },
      cosponsored: { count: 1, topics: [] },
      recentSponsoredBills: [
        { id: "HD1", title: "Sponsored", topic: "Education" }
      ]
    }
    const member = { Name: "Test Member" } as MemberContent

    render(<BillsTabContainer member={member} bills={bills} />)

    expect(screen.getByTestId("topic-bill-groups").textContent).toBe(
      JSON.stringify({
        all: 2,
        sponsored: 1,
        cosponsored: 1
      })
    )
    expect(screen.getByTestId("recent-bills").textContent).toBe("HD1:1")
    expect(screen.getByTestId("committee-member").textContent).toBe(
      "Test Member"
    )
  })
})
