import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { Bill } from "functions/src/bills/types"
import { BillsByTopic } from "./BillsByTopic"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const makeBill = (id: string, topic: string, subtopic: string): Bill =>
  ({
    id,
    topics: [
      { category: "Test", topic },
      { category: "Test", topic: subtopic }
    ]
  } as Bill)

describe("BillsByTopic", () => {
  const billGroups = {
    all: [
      makeBill("sponsored-only", "Sponsored topic", "Sponsored subtopic"),
      makeBill("shared", "Shared topic", "Shared subtopic"),
      makeBill("cosponsored-only", "Cosponsored topic", "Cosponsored subtopic")
    ],
    sponsored: [
      makeBill("sponsored-only", "Sponsored topic", "Sponsored subtopic"),
      makeBill("shared", "Shared topic", "Shared subtopic")
    ],
    cosponsored: [
      makeBill("shared", "Shared topic", "Shared subtopic"),
      makeBill("cosponsored-only", "Cosponsored topic", "Cosponsored subtopic")
    ]
  }

  it("shows each bill group's own count, with all counting the unique union", () => {
    render(<BillsByTopic billGroups={billGroups} />)

    const buttons = screen.getAllByRole("button")

    expect(buttons.map(button => button.textContent)).toEqual([
      "2billsSponsored",
      "2cosponsored",
      "All3"
    ])
    expect(buttons[2].getAttribute("aria-pressed")).toBe("true")
    expect(screen.getByText("3 profiles.bills • All")).toBeTruthy()
  })

  it("renders only bills from the selected group and updates active button state", () => {
    render(<BillsByTopic billGroups={billGroups} />)

    fireEvent.click(screen.getByRole("button", { name: /cosponsored/ }))

    expect(
      screen
        .getByRole("button", { name: /cosponsored/ })
        .getAttribute("aria-pressed")
    ).toBe("true")
    expect(screen.getByText("Cosponsored topic")).toBeTruthy()
    expect(screen.getByText("Shared topic")).toBeTruthy()
    expect(screen.queryByText("Sponsored topic")).toBeNull()
    expect(screen.getByText("2 profiles.bills • cosponsored")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: /billsSponsored/ }))

    expect(
      screen.getByText("2 profiles.bills • profiles.primarySponsor")
    ).toBeTruthy()
    expect(screen.getByText("Sponsored topic")).toBeTruthy()
    expect(screen.queryByText("Cosponsored topic")).toBeNull()
  })
})
