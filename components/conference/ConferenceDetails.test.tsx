import "@testing-library/jest-dom"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
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

// jsdom has none; the page watches its title's height, and the tabs the
// column their sections sit in. Kept, so a test can say something resized.
const resized: (() => void)[] = []
class Observer {
  constructor(callback: () => void) {
    resized.push(callback)
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.assign(global, { ResizeObserver: Observer })

const profile = { representative: { id: "AHP1" } }
jest.mock("../db", () => ({
  useProfile: () => ({ profile }),
  useConferenceTestimony: () => ({ items: [], loading: false })
}))

// Signed out, so the panel is not mounted and the page needs no store.
jest.mock("../auth", () => ({
  useAuth: () => ({ user: undefined, authenticated: false })
}))
jest.mock("../hooks", () => ({ useAppDispatch: () => jest.fn() }))
jest.mock("./input/useFollowedAuthors", () => ({
  useFollowedAuthors: () => new Set()
}))

const mockBill = jest.fn()
jest.mock("../db/bills", () => ({
  useBill: (court: number, id: string) => mockBill(court, id)
}))

const loaded = (id: string, Title: string, DocumentText?: string) => ({
  loading: false,
  result: { id, content: { Title, DocumentText } }
})

const texts: Record<string, ReturnType<typeof loaded>> = {
  S2581: loaded(
    "S2581",
    "An Act to promote student learning",
    "\tSECTION 1. Phones.\r\n\r\n\tSECTION 2. Pouches."
  ),
  H5366: loaded(
    "H5366",
    "An Act relative to student mental health",
    "SECTION 1. Social media."
  )
}

const conference: ConferencePageProps["conference"] = {
  id: "student-learning-and-mental-health",
  name: "Phone-Free Schools",
  court: 194,
  title: "An Act to promote student learning and mental health",
  senateBillId: "S2581",
  houseBillId: "H5366",
  canonicalBillId: "S2581",
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
      canonicalBillId: "S2619",
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

beforeEach(() => {
  mockBill.mockImplementation((_court: number, id: string) => texts[id])
})

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

  it("takes input only while the conference is appointed", () => {
    const { unmount } = render(<ConferenceDetails {...props} />)
    expect(
      screen.getByRole("button", { name: "input.share" })
    ).toBeInTheDocument()
    unmount()
    const reported = { ...conference, status: "reportFiled" as const }
    render(<ConferenceDetails {...props} conference={reported} />)
    expect(
      screen.queryByRole("button", { name: "input.share" })
    ).not.toBeInTheDocument()
    // Public Input stays.
    expect(screen.getByText("input.empty_title")).toBeInTheDocument()
  })

  it("leads from its tabs to its sections", () => {
    const { container } = render(<ConferenceDetails {...props} />)
    const tabs = within(screen.getByRole("navigation", { name: "tabs_label" }))
      .getAllByRole("link")
      .map(a => [a.textContent, a.getAttribute("href")])
    expect(tabs).toEqual([
      ["tab_committee", "#committee"],
      ["tab_input", "#input"],
      ["tab_text", "#text"]
    ])
    for (const [, href] of tabs)
      expect(container.querySelector(href!)).toBeTruthy()
  })

  it("lights the tab of the section that has come up under the tabs", () => {
    // jsdom lays nothing out, so each section says where it is, 850px tall.
    const tops: Record<string, number> = {
      committee: 0,
      input: 900,
      text: 1800
    }
    const rect = jest
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        const top = tops[this.id] ?? 0
        return { top, bottom: top + 850 } as DOMRect
      })
    render(<ConferenceDetails {...props} />)
    const lit = () =>
      screen
        .getAllByRole("link")
        .filter(a => a.getAttribute("aria-current") === "true")
        .map(a => a.textContent)
    expect(lit()).toEqual(["tab_committee"])
    // The last section lights too, once a jump has parked it.
    tops.input = -900
    tops.text = 0
    fireEvent.scroll(document)
    expect(lit()).toEqual(["tab_text"])
    // A section can move with no scroll, when one above it grows: posting
    // puts Your Input above Public Input.
    tops.input = 900
    tops.text = 1800
    act(() => resized.forEach(heard => heard()))
    expect(lit()).toEqual(["tab_committee"])
    rect.mockRestore()
  })

  describe("bill text", () => {
    it("shows both texts side by side, Senate first, a paragraph per line", () => {
      render(<ConferenceDetails {...props} />)
      const sheets = screen.getAllByRole("article")
      expect(sheets.map(s => s.getAttribute("aria-label"))).toEqual([
        "senate S2581",
        "house H5366"
      ])
      expect(sheets[0]).toHaveTextContent("An Act to promote student learning")
      // Each line on its own: the blank line between them is dropped.
      expect(screen.getByText("SECTION 1. Phones.")).toBeInTheDocument()
      expect(screen.getByText("SECTION 2. Pouches.")).toBeInTheDocument()
      expect(sheets[1]).toHaveTextContent("SECTION 1. Social media.")
      expect(mockBill).toHaveBeenCalledWith(194, "S2581")
      expect(mockBill).toHaveBeenCalledWith(194, "H5366")
    })

    it("shows one chamber's text when one is picked, without fetching again", () => {
      render(<ConferenceDetails {...props} />)
      mockBill.mockClear()
      fireEvent.change(screen.getByLabelText("version"), {
        target: { value: "house" }
      })
      const sheets = screen.getAllByRole("article")
      expect(sheets).toHaveLength(1)
      expect(sheets[0]).toHaveAttribute("aria-label", "house H5366")
      // The hidden Senate text stays fetched, ready for switching back.
      expect(mockBill).toHaveBeenCalledWith(194, "S2581")
    })

    it("spins while a bill loads", () => {
      mockBill.mockImplementation((_court: number, id: string) =>
        id === "H5366" ? { loading: true } : texts[id]
      )
      render(<ConferenceDetails {...props} />)
      expect(screen.getByRole("status")).toHaveTextContent("text_loading")
      expect(screen.getAllByRole("article")).toHaveLength(1)
    })

    it("links to the PDF where MAPLE has no text", () => {
      mockBill.mockImplementation((_court: number, id: string) =>
        id === "H5366" ? loaded("H5366", "An Act", undefined) : texts[id]
      )
      render(<ConferenceDetails {...props} />)
      expect(screen.getByText("text_missing H5366")).toBeInTheDocument()
      expect(screen.getByText("text_pdf").closest("a")).toHaveAttribute(
        "href",
        "https://malegislature.gov/Bills/194/H5366.pdf"
      )
    })
  })
})
