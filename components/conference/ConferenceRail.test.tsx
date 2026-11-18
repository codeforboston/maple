import "@testing-library/jest-dom"
import { fireEvent, render, screen } from "@testing-library/react"
import { RailList, SHOW_PAST_CONFERENCES } from "./ConferenceRail"
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
  reportBillId: null,
  confereeCounts: { senate: 3, house: 3 },
  analysisUpdatedAt: "2026-11-18"
})

const conferences = [
  conference("sitting"),
  conference("enacted", "enacted"),
  conference("dissolved", "dissolved")
]

const fold = () => screen.getByText("rail_closed").closest("details")!
const folded = { open: false, onToggle: () => {} }

// The fold's own behaviour, while past conferences are listed at all
// (SHOW_PAST_CONFERENCES).
const describeFold = SHOW_PAST_CONFERENCES ? describe : describe.skip

describe("RailList without past conferences", () => {
  // While they are off, they aren't in the page at all, folded or hidden.
  ;(SHOW_PAST_CONFERENCES ? it.skip : it)(
    "lists only the conferences still sitting",
    () => {
      const { container } = render(
        <RailList conferences={conferences} current="sitting" fold={folded} />
      )

      expect(container.querySelector("details")).toBeNull()
      expect(screen.queryByText("rail_closed")).not.toBeInTheDocument()
      expect(screen.getByRole("link", { name: /sitting/ })).toBeInTheDocument()
      expect(container.querySelector('a[href*="enacted"]')).toBeNull()
      expect(container.querySelector('a[href*="dissolved"]')).toBeNull()
    }
  )
})

describeFold("RailList", () => {
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
