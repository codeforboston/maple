import React from "react"
import { render, screen } from "@testing-library/react"
import { MemberContent } from "functions/src/members/types"
import { Bill } from "functions/src/bills/types"
import { BillsTabContainer } from "./BillsTabContainer"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

jest.mock("./Bills/BillsByTopic", () => ({
  BillsByTopic: ({
    billGroups
  }: {
    billGroups: {
      all: { id: string }[]
      sponsored: { id: string }[]
      cosponsored: { id: string }[]
    }
  }) =>
    React.createElement(
      "div",
      { "data-testid": "topic-bill-groups" },
      JSON.stringify({
        all: billGroups.all.map(bill => bill.id),
        sponsored: billGroups.sponsored.map(bill => bill.id),
        cosponsored: billGroups.cosponsored.map(bill => bill.id)
      })
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
    const bills = {
      all: [{ id: "all-1" }, { id: "all-2" }],
      sponsored: [{ id: "sponsored-1" }],
      cosponsored: [{ id: "cosponsored-1" }]
    } as BillGroupsForTest
    const member = { Name: "Test Member" } as MemberContent

    render(<BillsTabContainer member={member} bills={bills} />)

    expect(screen.getByTestId("topic-bill-groups").textContent).toBe(
      JSON.stringify({
        all: ["all-1", "all-2"],
        sponsored: ["sponsored-1"],
        cosponsored: ["cosponsored-1"]
      })
    )
    expect(screen.getByTestId("recent-bills").textContent).toBe("sponsored-1")
    expect(screen.getByTestId("committee-member").textContent).toBe(
      "Test Member"
    )
  })
})

type BillGroupsForTest = {
  all: Bill[]
  sponsored: Bill[]
  cosponsored: Bill[]
}
