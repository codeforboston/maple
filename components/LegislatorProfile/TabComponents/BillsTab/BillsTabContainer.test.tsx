import React from "react"
import { render, screen } from "@testing-library/react"
import { MemberContent } from "components/db"
import { MemberBillSummary } from "functions/src/members/memberBillSummary"
import { BillsTabContainer } from "./BillsTabContainer"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

jest.mock("./Bills/BillsByTopic", () => ({
  BillsByTopic: ({ summary }: { summary: MemberBillSummary }) =>
    React.createElement(
      "div",
      { "data-testid": "topic-bill-groups" },
      JSON.stringify(summary)
    )
}))

jest.mock("./Bills/RecentBills", () => ({
  RecentBills: ({ bills }: { bills: { id: string }[] }) =>
    React.createElement(
      "div",
      { "data-testid": "recent-bills" },
      bills.map(bill => bill.id).join(",")
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
  it("passes all bill groups to topic view and sponsored bills to recent bills", () => {
    const summary: MemberBillSummary = {
      schemaVersion: 2,
      all: { count: 2, topics: [] },
      sponsored: { count: 1, topics: [] },
      cosponsored: { count: 1, topics: [] },
      recentSponsoredBills: [
        { id: "sponsored-1", title: "Sponsored bill", topic: "Education" }
      ]
    }
    const member = { Name: "Test Member" } as unknown as MemberContent

    render(<BillsTabContainer member={member} summary={summary} court={194} />)

    expect(screen.getByTestId("topic-bill-groups").textContent).toBe(
      JSON.stringify(summary)
    )
    expect(screen.getByTestId("recent-bills").textContent).toBe("sponsored-1")
    expect(screen.getByTestId("committee-member").textContent).toBe(
      "Test Member"
    )
  })
})
