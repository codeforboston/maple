import React from "react"
import { render, screen, within } from "@testing-library/react"
import { MemberContent } from "components/db"
import { RecentSponsoredBill } from "functions/src/members/memberBillSummary"
import { RecentBills } from "./RecentBills"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const makeBill = (id: string): RecentSponsoredBill => ({
  id,
  title: `Title ${id}`,
  topic: "Subtopic"
})

describe("RecentBills", () => {
  it("renders the supplied recent bills and total sponsored bill count", () => {
    const bills = [
      makeBill("H1045"),
      makeBill("H1030"),
      makeBill("H1020"),
      makeBill("H1001")
    ]

    render(
      <RecentBills
        bills={bills}
        billCount={12}
        court={194}
        member={
          {
            MemberCode: "ABC123",
            GeneralCourtNumber: 194
          } as unknown as MemberContent
        }
      />
    )

    const rows = screen.getAllByRole("row").slice(1)
    expect(
      rows.map(row => within(row).getByText(/^H\d+$/).textContent)
    ).toEqual(["H1045", "H1030", "H1020", "H1001"])
    expect(
      screen.getByText("profiles.recentSponsoredBills.viewBills")
    ).toBeTruthy()
  })
})
