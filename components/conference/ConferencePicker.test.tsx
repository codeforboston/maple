import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { createRef } from "react"
import { ConferenceDrawer, ConferencePopover } from "./ConferencePicker"
import { ConferenceSummary } from "./types"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const conference = (
  id: string,
  status: ConferenceSummary["status"] = "appointed",
  more: Partial<ConferenceSummary> = {}
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
  analysisUpdatedAt: "2026-11-18",
  ...more
})

// One taking input, and two that don't: one not covered, and one past.
const conferences = [
  conference("sitting"),
  conference("uncovered", "appointed", { covered: false }),
  conference("enacted", "enacted", { reportBillId: "H5350" })
]

/** Where each of the list's rows goes. */
const listed = () =>
  screen.getAllByRole("link").map(a => a.getAttribute("href"))

describe("The pickers", () => {
  it("list only the conferences taking input in the sheet", () => {
    // The sheet asks the window's width of matchMedia, which jsdom leaves out.
    window.matchMedia = jest.fn(() => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {}
    })) as never
    render(
      <ConferenceDrawer conferences={conferences} show onHide={() => {}} />
    )

    expect(listed()).toEqual([expect.stringContaining("sitting")])
    expect(screen.queryByText("rail_not_covered")).not.toBeInTheDocument()
  })

  it("list only the conferences taking input in the popover", () => {
    const anchor = createRef<HTMLButtonElement>()
    render(
      <>
        <button ref={anchor} />
        <ConferencePopover
          conferences={conferences}
          anchor={anchor}
          onClose={() => {}}
        />
      </>
    )

    expect(listed()).toEqual([expect.stringContaining("sitting")])
    expect(screen.queryByText("rail_not_covered")).not.toBeInTheDocument()
  })
})
