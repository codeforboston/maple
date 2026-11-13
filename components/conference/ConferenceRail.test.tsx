import "@testing-library/jest-dom"
import { fireEvent, render, screen } from "@testing-library/react"
import { RailList } from "./ConferenceRail"
import { ConferenceSummary } from "./types"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const conference = (
  id: string,
  status: ConferenceSummary["status"] = "appointed"
): ConferenceSummary => ({
  id,
  court: 194,
  name: id,
  title: id,
  senateBillId: "S1",
  houseBillId: "H1",
  canonicalBillId: "S1",
  status,
  covered: true,
  reportBillId: null
})

const conferences = [
  conference("sitting"),
  conference("enacted", "enacted"),
  conference("dissolved", "dissolved")
]

const fold = () => screen.getByText("rail_closed").closest("details")!
const folded = { open: false, onToggle: () => {} }

describe("RailList", () => {
  it("folds the conferences no longer taking input below the rest, closed", () => {
    render(
      <RailList conferences={conferences} current="sitting" fold={folded} />
    )

    expect(fold()).not.toHaveAttribute("open")
    expect(fold()).toContainElement(
      screen.getByRole("link", { name: /enacted/ })
    )
    expect(fold()).not.toContainElement(
      screen.getByRole("link", { name: /sitting/ })
    )
  })

  it("opens as the page says, marking the conference being read", () => {
    render(
      <RailList
        conferences={conferences}
        current="enacted"
        fold={{ open: true, onToggle: () => {} }}
      />
    )

    expect(fold()).toHaveAttribute("open")
    expect(screen.getByRole("link", { name: /enacted/ })).toHaveAttribute(
      "aria-current",
      "page"
    )
  })

  it("tells the page when the reader opens it", () => {
    const onToggle = jest.fn()
    render(
      <RailList
        conferences={conferences}
        current="sitting"
        fold={{ open: false, onToggle }}
      />
    )

    fold().open = true
    fireEvent(fold(), new Event("toggle"))

    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it("has no fold when every conference is still sitting", () => {
    render(
      <RailList
        conferences={[conference("a"), conference("b")]}
        current="a"
        fold={folded}
      />
    )

    expect(screen.queryByText("rail_closed")).not.toBeInTheDocument()
  })
})
