import React from "react"
import { render, screen, within } from "@testing-library/react"
import { Bill } from "functions/src/bills/types"
import { RecentBills } from "./RecentBills"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const makeBill = (id: string): Bill =>
  ({
    id,
    content: { Title: `Title ${id}` },
    topics: [
      { category: "", topic: "Topic" },
      { category: "", topic: "Subtopic" }
    ]
  } as Bill)

describe("RecentBills", () => {
  it("sorts by descending bill number before rendering the five most recent", () => {
    const bills = [
      makeBill("H1029"),
      makeBill("H1045"),
      makeBill("H1001"),
      makeBill("H1030"),
      makeBill("H1020"),
      makeBill("H1040")
    ]
    const originalOrder = bills.map(bill => bill.id)

    render(<RecentBills bills={bills} />)

    const rows = screen.getAllByRole("row").slice(1)
    expect(
      rows.map(row => within(row).getByText(/^H\d+$/).textContent)
    ).toEqual(["H1045", "H1040", "H1030", "H1029", "H1020"])
    expect(bills.map(bill => bill.id)).toEqual(originalOrder)
  })
})
