import "@testing-library/jest-dom"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { ConferenceExplorer } from "./ConferenceExplorer"
import type { ConfereeView, ConferenceIndexProps } from "./types"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts && Object.keys(opts).length
        ? `${key} ${Object.values(opts).join(" ")}`
        : key,
    i18n: { language: "en" }
  })
}))

jest.mock("usehooks-ts", () => ({ useMediaQuery: () => false }))

jest.mock("../featureFlags", () => ({
  useFlags: () => ({ legislators: false })
}))

const profile = { representative: { id: "AHP1" } }
jest.mock("../db", () => ({ useProfile: () => ({ profile }) }))

const person = (
  memberCode: string,
  branch: "Senate" | "House",
  name: string,
  party: string,
  district: string,
  seat: string,
  chair = false
): ConfereeView => ({
  memberCode,
  branch,
  chair,
  name,
  party,
  district,
  seat
})

// Crighton sits on both, chairing one.
const crighton = (chair: boolean) =>
  person(
    "BPC0",
    "Senate",
    "Brendan P. Crighton",
    "Democrat",
    "Third Essex",
    "senate-3-essex",
    chair
  )

const props: ConferenceIndexProps = {
  conferences: [
    {
      id: "student-learning-and-mental-health",
      court: 194,
      name: "Phone-Free Schools",
      title: "An Act to promote student learning and mental health",
      senateBillId: "S2581",
      houseBillId: "H5366",
      canonicalBillId: "S2581",
      status: "appointed"
    },
    {
      id: "data-privacy",
      court: 194,
      name: "Data Privacy",
      title: "An Act establishing the Massachusetts data privacy act",
      senateBillId: "S2619",
      houseBillId: "H5479",
      canonicalBillId: "S2619",
      status: "reportFiled"
    }
  ],
  conferees: {
    "student-learning-and-mental-health": [
      crighton(true),
      person(
        "MJR0",
        "Senate",
        "Michael J. Rodrigues",
        "Democrat",
        "First Bristol and Plymouth",
        "senate-1-bristol-plymouth"
      ),
      person(
        "PJD0",
        "Senate",
        "Peter J. Durant",
        "Republican",
        "Worcester and Hampshire",
        "senate-worcester-hampshire"
      ),
      person(
        "AHP1",
        "House",
        "Alice Hanlon Peisch",
        "Democrat",
        "14th Norfolk",
        "house-14-norfolk",
        true
      ),
      person(
        "FAM1",
        "House",
        "Frank A. Moran",
        "Democrat",
        "17th Essex",
        "house-17-essex"
      ),
      person(
        "DTV1",
        "House",
        "David T. Vieira",
        "Republican",
        "3rd Barnstable",
        "house-3-barnstable"
      )
    ],
    "data-privacy": [
      crighton(false),
      person(
        "CMC0",
        "Senate",
        "Cynthia Stone Creem",
        "Democrat",
        "Norfolk and Middlesex",
        "senate-norfolk-middlesex",
        true
      ),
      person(
        "MOC0",
        "House",
        "Michael J. Moran",
        "Democrat",
        "18th Suffolk",
        "house-18-suffolk",
        true
      )
    ]
  }
}

const table = (container: HTMLElement) => container.querySelector("table")!
const row = (container: HTMLElement, name: string) =>
  within(table(container)).getByText(name).closest("tr")!

describe("ConferenceExplorer", () => {
  it("lists every conference and lights every conferee's seat", () => {
    const { container } = render(<ConferenceExplorer {...props} />)
    expect(table(container).querySelectorAll("tbody tr")).toHaveLength(2)
    expect(row(container, "Data Privacy")).toHaveTextContent(
      "status.reportFiled"
    )
    // Crighton once, though he sits on both.
    expect(screen.getByText("seats_lit senate 4 40")).toBeInTheDocument()
    expect(screen.getByText("seats_lit house 4 160")).toBeInTheDocument()
    expect(screen.getByText("explorer_empty")).toBeInTheDocument()
    // The narrow layout's list links straight to each page.
    expect(
      container.querySelector('a[href="/conferences/194/data-privacy"]')
    ).toBeTruthy()
  })

  it("holds a conference: its six, its seats and its page", () => {
    const { container } = render(<ConferenceExplorer {...props} />)
    fireEvent.click(row(container, "Phone-Free Schools"))

    for (const name of ["B. Crighton", "A. Peisch", "D. Vieira"]) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
    expect(screen.getByText("seats_lit senate 3 40")).toBeInTheDocument()
    expect(screen.getByText("seats_lit house 3 160")).toBeInTheDocument()
    expect(screen.getByText("go_to_conference")).toHaveAttribute(
      "href",
      "/conferences/194/student-learning-and-mental-health"
    )

    // Choosing it again lets it go.
    fireEvent.click(row(container, "Phone-Free Schools"))
    expect(screen.getByText("explorer_empty")).toBeInTheDocument()
  })

  it("holds a seat: the legislator and the rows they sit on", () => {
    const { container } = render(<ConferenceExplorer {...props} />)
    fireEvent.click(container.querySelector('polygon[aria-label="F. Moran"]')!)
    // Moran sits only on Phone-Free Schools; the other row is set back.
    // (The table sits in the wide layout, hidden at jsdom's width, so the
    // buttons are found by selector rather than by role.)
    const name = (n: string) => row(container, n).querySelector("button")!
    expect(name("Phone-Free Schools")).toHaveStyle({ fontWeight: 700 })
    expect(name("Data Privacy")).toHaveStyle({ fontWeight: 400 })

    fireEvent.click(
      container.querySelector('polygon[aria-label="B. Crighton"]')!
    )
    const panel = screen.getByText("Brendan P. Crighton").closest("div")!
      .parentElement!
    expect(within(panel).getByText("Phone-Free Schools")).toHaveAttribute(
      "href",
      "/conferences/194/student-learning-and-mental-health"
    )
    expect(within(panel).getByText("Data Privacy")).toHaveAttribute(
      "href",
      "/conferences/194/data-privacy"
    )
    // Chair of one, member of the other.
    expect(within(panel).getAllByText("chair")).toHaveLength(1)
  })

  it("shows the reader's own legislators from the toggle", () => {
    render(<ConferenceExplorer {...props} />)
    fireEvent.click(screen.getByLabelText("my_legislators"))
    expect(screen.getByText("Alice Hanlon Peisch")).toBeInTheDocument()
    expect(screen.getByText("seats_lit house 1 160")).toBeInTheDocument()
    expect(screen.getByText("seats_lit senate 0 40")).toBeInTheDocument()
  })
})
