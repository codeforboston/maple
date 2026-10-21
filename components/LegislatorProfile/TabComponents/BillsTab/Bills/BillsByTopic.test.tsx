import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemberBillSummary } from "functions/src/members/memberBillSummary"
import { BillsByTopic } from "./BillsByTopic"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

describe("BillsByTopic", () => {
  const billGroups: Pick<
    MemberBillSummary,
    "all" | "sponsored" | "cosponsored"
  > = {
    all: {
      count: 3,
      topics: [
        {
          topic: "Sponsored topic",
          count: 1,
          subtopics: [{ topic: "Sponsored subtopic", count: 1 }]
        },
        {
          topic: "Shared topic",
          count: 1,
          subtopics: [{ topic: "Shared subtopic", count: 1 }]
        },
        {
          topic: "Cosponsored topic",
          count: 1,
          subtopics: [{ topic: "Cosponsored subtopic", count: 1 }]
        }
      ]
    },
    sponsored: {
      count: 2,
      topics: [
        {
          topic: "Sponsored topic",
          count: 1,
          subtopics: [{ topic: "Sponsored subtopic", count: 1 }]
        },
        {
          topic: "Shared topic",
          count: 1,
          subtopics: [{ topic: "Shared subtopic", count: 1 }]
        }
      ]
    },
    cosponsored: {
      count: 1,
      topics: [
        {
          topic: "Cosponsored topic",
          count: 1,
          subtopics: [{ topic: "Cosponsored subtopic", count: 1 }]
        }
      ]
    }
  }

  it("shows each bill group's own count, with all counting the unique union", () => {
    render(<BillsByTopic billGroups={billGroups} />)

    const buttons = screen.getAllByRole("button")

    expect(buttons.map(button => button.textContent)).toEqual([
      "2billsSponsored",
      "1cosponsored",
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
    expect(screen.queryByText("Shared topic")).toBeNull()
    expect(screen.queryByText("Sponsored topic")).toBeNull()
    expect(
      screen.getByText("1 profiles.bills • profiles.coSponsor")
    ).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: /billsSponsored/ }))

    expect(
      screen.getByText("2 profiles.bills • profiles.primarySponsor")
    ).toBeTruthy()
    expect(screen.getByText("Sponsored topic")).toBeTruthy()
    expect(screen.queryByText("Cosponsored topic")).toBeNull()
  })
})
