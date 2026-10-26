import "@testing-library/jest-dom"
import { fireEvent, render, screen } from "@testing-library/react"
import Router from "next/router"
import { ConferenceDetails } from "./ConferenceDetails"
import type { ConferencePageProps } from "./types"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts?.returnObjects
        ? // The hero's five steps.
          Array.from({ length: 5 }, (_, i) => ({
            h: `${key}.${i}.h`,
            p: `${key}.${i}.p`
          }))
        : opts && Object.keys(opts).length
        ? `${key} ${Object.values(opts).join(" ")}`
        : key,
    i18n: { language: "en" }
  }),
  // The key, the values and the links it would wrap, so a test can find the
  // link targets without an i18n instance.
  Trans: ({
    i18nKey,
    values = {},
    components = {}
  }: {
    i18nKey: string
    values?: Record<string, unknown>
    components?: Record<string, JSX.Element>
  }) => (
    <span data-testid={i18nKey}>
      {Object.values(values).join(" ")}
      {Object.values(components)}
    </span>
  )
}))

let asPath = "/conferences/194/data-privacy"
jest.mock("next/router", () => ({
  __esModule: true,
  default: { events: { on: jest.fn() } },
  useRouter: () => ({ asPath })
}))
/** Next starting a change of address, as the hooks hear it. */
const routeChangeStart = (url: string) =>
  jest.mocked(Router.events.on).mock.calls[0][1](url)

jest.mock("usehooks-ts", () => ({ useMediaQuery: () => false }))

let mockLegislators = false
jest.mock("../featureFlags", () => ({
  useFlags: () => ({
    legislators: mockLegislators,
    hearingsAndTranscriptions: true
  })
}))

const profile = { representative: { id: "AHP1" } }
jest.mock("../db", () => ({ useProfile: () => ({ profile }) }))

const conference: ConferencePageProps["conference"] = {
  id: "student-learning-and-mental-health",
  name: "Phone-Free Schools",
  court: 194,
  title: "An Act to promote student learning and mental health",
  senateBillId: "S2581",
  houseBillId: "H5366",
  status: "appointed"
}

const props: ConferencePageProps = {
  conference,
  conferences: [
    conference,
    {
      id: "data-privacy",
      court: 194,
      name: "Data Privacy",
      title: "An Act establishing the Massachusetts data privacy act",
      senateBillId: "S2619",
      houseBillId: "H5479",
      status: "appointed"
    }
  ],
  conferees: [
    {
      memberCode: "BPC0",
      branch: "Senate",
      chair: true,
      name: "Brendan P. Crighton",
      party: "Democrat",
      district: "Third Essex",
      seat: "senate-3-essex"
    },
    {
      memberCode: "MJR0",
      branch: "Senate",
      chair: false,
      name: "Michael J. Rodrigues",
      party: "Democrat",
      district: "First Bristol and Plymouth",
      seat: "senate-1-bristol-plymouth"
    },
    {
      memberCode: "PJD0",
      branch: "Senate",
      chair: false,
      name: "Peter J. Durant",
      party: "Republican",
      district: "Worcester and Hampshire",
      seat: "senate-worcester-hampshire"
    },
    {
      memberCode: "AHP1",
      branch: "House",
      chair: true,
      name: "Alice Hanlon Peisch",
      party: "Democrat",
      district: "14th Norfolk",
      seat: "house-14-norfolk"
    },
    {
      memberCode: "FAM1",
      branch: "House",
      chair: false,
      name: "Frank A. Moran",
      party: "Democrat",
      district: "17th Essex",
      seat: "house-17-essex"
    },
    {
      memberCode: "DTV1",
      branch: "House",
      chair: false,
      name: "David T. Vieira",
      party: "Republican",
      district: "3rd Barnstable",
      seat: "house-3-barnstable"
    }
  ],
  hearings: [
    {
      id: "hearing-5710",
      eventId: 5710,
      startsAt: Date.UTC(2026, 5, 4, 17)
    }
  ]
}

describe("ConferenceDetails", () => {
  const { scrollTo } = window

  beforeEach(() => {
    asPath = "/conferences/194/data-privacy"
    // Arriving by a link, unless a test says otherwise.
    routeChangeStart("/conferences/194/elsewhere")
    window.scrollTo = jest.fn()
  })

  afterEach(() => {
    window.scrollTo = scrollTo
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true })
  })

  it("leaves a reader Back brought, even to the top, then re-lands them on a new address", () => {
    routeChangeStart(location.pathname)
    const { rerender } = render(<ConferenceDetails {...props} />)
    expect(window.scrollTo).not.toHaveBeenCalled()

    asPath = "/conferences/194/other"
    rerender(<ConferenceDetails {...props} />)
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "auto" })
    )
  })

  it("lands a reader a link brought, scrolled or not, at the conference", () => {
    // A rail click from the landing keeps the landing's scroll; Next starts
    // the change before the address moves.
    Object.defineProperty(window, "scrollY", { value: 900, configurable: true })
    routeChangeStart("/conferences/194/data-privacy")
    render(<ConferenceDetails {...props} />)
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "auto" })
    )
    // Back has moved it already.
    jest.mocked(window.scrollTo).mockClear()
    routeChangeStart(location.pathname)
    render(<ConferenceDetails {...props} />)
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it("has one h1: the conference's, or the hero's on the landing", () => {
    const { unmount } = render(<ConferenceDetails {...props} />)
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    unmount()
    render(<ConferenceDetails {...props} openOnHero />)
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
  })

  it("opens a conference's address at the conference, under the hero", () => {
    render(<ConferenceDetails {...props} />)
    expect(
      screen.getByRole("heading", { name: "hero.steps.0.h" })
    ).toBeInTheDocument()
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0, behavior: "auto" })
    )
  })

  it("opens the landing on the hero and links to the explorer", () => {
    render(<ConferenceDetails {...props} openOnHero />)
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(5)
    expect(screen.getByRole("link", { name: "explorer" })).toHaveAttribute(
      "href",
      "/conferences/explorer"
    )
    fireEvent.click(screen.getByRole("button", { name: /hero.see/ }))
    expect(window.scrollTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ behavior: "smooth" })
    )
  })

  it("names the six, the chairs, the bills and the hearing", () => {
    const { container } = render(<ConferenceDetails {...props} />)

    for (const name of [
      "B. Crighton",
      "M. Rodrigues",
      "P. Durant",
      "A. Peisch",
      "F. Moran",
      "D. Vieira"
    ]) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
    expect(screen.getAllByText("chair")).toHaveLength(2)

    const byline = screen.getByTestId("byline")
    expect(byline).toHaveTextContent("S.2581")
    expect(byline).toHaveTextContent("H.5366")
    expect(container.querySelector('a[href="/bills/194/S2581"]')).toBeTruthy()
    expect(container.querySelector('a[href="/bills/194/H5366"]')).toBeTruthy()

    expect(screen.getByText(/hearing_held June 4, 2026/)).toHaveAttribute(
      "href",
      "/hearing/5710"
    )
    expect(screen.getByText("seats_lit senate 3 40")).toBeInTheDocument()
    expect(screen.getByText("seats_lit house 3 160")).toBeInTheDocument()
  })

  it("marks the viewer's own legislator", () => {
    render(<ConferenceDetails {...props} />)
    // Under the name in place of the district, and as the star on the portrait.
    expect(screen.getByText("your_representative")).toBeInTheDocument()
    expect(screen.getByLabelText("your_representative")).toBeInTheDocument()
    expect(screen.queryByText("14th Norfolk")).not.toBeInTheDocument()
    expect(screen.getByText("Third Essex")).toBeInTheDocument()
  })

  describe("conferee names", () => {
    afterEach(() => {
      mockLegislators = false
    })

    it("never nests a link in a button", () => {
      const { container } = render(<ConferenceDetails {...props} />)
      expect(container.querySelector("button a, a button")).toBeNull()
    })

    it("sends the name to malegislature.gov as an external link", () => {
      render(<ConferenceDetails {...props} />)
      const name = screen.getByText("A. Peisch").closest("a")!
      expect(name).toHaveAttribute(
        "href",
        expect.stringMatching(
          /^https:\/\/malegislature\.gov\/Legislators\/Profile\//
        )
      )
      expect(name).toHaveAttribute("target", "_blank")
    })

    it("keeps the name in the app when legislator pages are on", () => {
      mockLegislators = true
      render(<ConferenceDetails {...props} />)
      const name = screen.getByText("A. Peisch").closest("a")!
      expect(name.getAttribute("href")).toMatch(/^\/legislators\/194\//)
      expect(name).not.toHaveAttribute("target")
    })
  })

  it("lists every conference in the rail with the current one marked", () => {
    const { container } = render(<ConferenceDetails {...props} />)
    const other = 'a[href="/conferences/194/data-privacy"]'
    expect(container.querySelectorAll(other)).toHaveLength(1)
    expect(container.querySelector('a[aria-current="page"]')).toHaveTextContent(
      "Phone-Free Schools"
    )
    // The phone picker opens the same list from the title.
    fireEvent.click(screen.getByLabelText("pick_conference"))
    expect(container.querySelectorAll(other)).toHaveLength(2)
  })

  it("lights a district when a conferee is pointed at", () => {
    const { container } = render(<ConferenceDetails {...props} />)
    const peisch = screen.getByRole("button", { name: /Peisch,/ })
    fireEvent.pointerEnter(peisch.parentElement!)
    expect(peisch).toHaveAttribute("aria-pressed", "true")
    const cell = container.querySelector(
      'polygon[aria-label="A. Peisch"][aria-pressed="true"]'
    )
    // Painted by party, and painted inline so the shared polygon rule in the
    // stylesheet cannot cover it; the other lit seats sit back.
    expect(cell).toHaveStyle({ fill: "#4682d5", fillOpacity: 1 })
    expect(
      container.querySelector('polygon[aria-label="D. Vieira"]')
    ).toHaveStyle({ fill: "#b53333", fillOpacity: 0.45 })
  })
})
