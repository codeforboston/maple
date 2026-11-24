import "@testing-library/jest-dom"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { SidebarGroups } from "./SidebarGroups"
import { ConferenceSummary } from "./types"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const conference = (
  id: string,
  more: Partial<ConferenceSummary> = {}
): ConferenceSummary => ({
  id,
  court: 194,
  name: id,
  title: id,
  senateBillId: "S1",
  houseBillId: "H1",
  canonicalBillId: "S1",
  status: "appointed",
  covered: true,
  reportBillId: null,
  confereeCounts: { senate: 3, house: 3 },
  analysisUpdatedAt: null,
  ...more
})

const conferences = [
  conference("Data Privacy"),
  conference("Ballot Questions"),
  conference("Bond Bill", { covered: false }),
  conference("Cannabis", { status: "enacted", reportBillId: "H5350" })
]

const section = () =>
  screen.getByRole("button", { name: /category\.notCovered/ })
const link = (name: string) =>
  screen.getByRole("link", { name: new RegExp(`^${name}`) })

describe("SidebarGroups", () => {
  it("lists the active conferences first, by name, outside any section", () => {
    render(<SidebarGroups conferences={conferences} current="Data Privacy" />)

    const links = screen.getAllByRole("link").map(a => a.textContent)
    expect(links[0]).toContain("Ballot Questions")
    expect(links[1]).toContain("Data Privacy")
    expect(link("Data Privacy")).toHaveAttribute("aria-current", "page")
    expect(link("Data Privacy").closest("[data-section]")).toBeNull()
  })

  it("puts the not covered conferences in a section, with its count and the note", () => {
    render(<SidebarGroups conferences={conferences} current="Data Privacy" />)

    expect(section()).toHaveTextContent("category.notCovered (1)")
    expect(section()).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByText("rail_not_covered")).toBeInTheDocument()
  })

  it("doesn't show groups that are off, or empty", () => {
    render(
      <SidebarGroups
        conferences={conferences.filter(c => c.covered)}
        current="Data Privacy"
      />
    )

    expect(screen.queryByText(/category\.enacted/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Cannabis/)).not.toBeInTheDocument()
    expect(screen.queryByText(/category\.notCovered/)).not.toBeInTheDocument()
  })

  it("starts collapsed on the section holding the current conference, showing its row", () => {
    render(<SidebarGroups conferences={conferences} current="Bond Bill" />)

    expect(section()).toHaveAttribute("aria-expanded", "false")
    expect(within(section()).getByText("rail_selected")).toBeInTheDocument()
    expect(link("Bond Bill")).toHaveAttribute("aria-current", "page")
  })

  it("remembers an opened section on the next conference, until it's closed", () => {
    const first = render(
      <SidebarGroups conferences={conferences} current="Data Privacy" />
    )
    fireEvent.click(section())
    expect(section()).toHaveAttribute("aria-expanded", "true")
    first.unmount()

    const next = render(
      <SidebarGroups conferences={conferences} current="Ballot Questions" />
    )
    expect(section()).toHaveAttribute("aria-expanded", "true")
    fireEvent.click(section())
    next.unmount()

    render(<SidebarGroups conferences={conferences} current="Data Privacy" />)
    expect(section()).toHaveAttribute("aria-expanded", "false")
  })
})
