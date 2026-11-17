import "@testing-library/jest-dom"
import { fireEvent, render, screen, within } from "@testing-library/react"
import type { ConferenceTestimony } from "components/db"
import { InputContext } from "./context"
import { PublicInput } from "./PublicInput"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts && Object.keys(opts).length
        ? `${key} ${Object.values(opts).join(" ")}`
        : key,
    i18n: { language: "en" }
  })
}))

// The actions reach for the store and the report API; the feed does not.
jest.mock("./Kebab", () => ({ Kebab: () => null }))
jest.mock("./EntryModal", () => ({ EntryModal: () => null }))

// jsdom has none of these, and the card and the clamp watch their width.
class Observer {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.assign(global, { ResizeObserver: Observer })

const entry = (
  n: number,
  overrides: Partial<ConferenceTestimony> = {}
): ConferenceTestimony =>
  ({
    id: `t${n}`,
    authorUid: `u${n}`,
    authorDisplayName: `Author ${n}`,
    fullName: `Author ${n}`,
    authorRole: "user",
    position: "passSomething",
    content: `Words ${n}`,
    publishedAt: { toDate: () => new Date(2026, 9, n) },
    ...overrides
  } as unknown as ConferenceTestimony)

const cosignOf = (
  n: number,
  of: number,
  overrides: Partial<ConferenceTestimony> = {}
) =>
  entry(n, {
    cosignOfId: `t${of}`,
    cosignOfAuthorUid: `u${of}`,
    ...overrides
  })

const many = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    entry(i + 1, {
      position: i % 2 ? "passNothing" : "passSomething",
      authorRole: i % 3 ? "user" : "organization"
    })
  )

const mount = (
  items: ConferenceTestimony[],
  context: Partial<React.ContextType<typeof InputContext>> = {}
) =>
  render(
    <InputContext.Provider
      value={{
        subject: "Phone-Free Schools",
        followed: new Set(),
        signedIn: true,
        byId: new Map(items.map(x => [x.id, x])),
        ...context
      }}
    >
      <PublicInput items={items} loading={false} />
    </InputContext.Provider>
  )

// A card's own name, which comes before its cosigns' names.
const authorOf = (a: HTMLElement) => a.querySelector("span[title]")?.textContent

const cardOf = (author: string) =>
  screen.getAllByRole("article").find(a => authorOf(a) === author)!

describe("PublicInput", () => {
  it("says so when nothing is filed, and keeps the filters", () => {
    render(<PublicInput items={[]} loading={false} />)
    expect(screen.getByText("input.empty_title")).toBeInTheDocument()
    expect(
      screen.getByLabelText("input.filter_by_position")
    ).toBeInTheDocument()
    expect(screen.queryByText("input.clear_filters")).not.toBeInTheDocument()
  })

  it("shows nothing while loading, not the empty state", () => {
    render(<PublicInput items={[]} loading />)
    expect(screen.queryByText("input.empty_title")).not.toBeInTheDocument()
  })

  it("leaves the filters off a short feed", () => {
    render(<PublicInput items={many(3)} loading={false} />)
    expect(screen.getAllByRole("article")).toHaveLength(3)
    expect(
      screen.queryByLabelText("input.filter_by_position")
    ).not.toBeInTheDocument()
  })

  it("pages five at a time", () => {
    render(<PublicInput items={many(7)} loading={false} />)
    expect(screen.getAllByRole("article")).toHaveLength(5)
    fireEvent.click(screen.getByRole("button", { name: "2" }))
    expect(screen.getAllByRole("article")).toHaveLength(2)
  })

  describe("landing on a card a link names", () => {
    const { scrollTo, matchMedia } = window
    beforeEach(() => {
      window.scrollTo = jest.fn()
      window.matchMedia = jest.fn(() => ({ matches: true })) as never
    })
    afterEach(() => {
      window.scrollTo = scrollTo
      window.matchMedia = matchMedia
    })

    it("turns to its page and scrolls to it", () => {
      // Newest first: the first is on the second page.
      render(<PublicInput items={many(7)} loading={false} focus="t1" />)
      expect(screen.getByText("Author 1")).toBeInTheDocument()
      expect(screen.getAllByRole("article")).toHaveLength(2)
      expect(window.scrollTo).toHaveBeenCalled()
    })

    it("lets go of a filter that would leave it out", async () => {
      const { rerender } = render(
        <PublicInput items={many(6)} loading={false} />
      )
      fireEvent.click(screen.getByLabelText("input.filter_by_position"))
      const menu = await screen.findByRole("menu")
      // many(): the odd-numbered entries pass nothing.
      fireEvent.click(within(menu).getByText("input.position.passNothing.long"))
      expect(screen.queryByText("Author 1")).not.toBeInTheDocument()
      rerender(<PublicInput items={many(6)} loading={false} focus="t1" />)
      expect(screen.getByText("Author 1")).toBeInTheDocument()
    })
  })

  it("narrows by position and offers a way back from an empty result", async () => {
    const items = [
      ...many(4).map(x => ({ ...x, position: "passSomething" as const }))
    ]
    render(<PublicInput items={items} loading={false} />)
    fireEvent.click(screen.getByLabelText("input.filter_by_position"))
    const menu = await screen.findByRole("menu")
    fireEvent.click(within(menu).getByText("input.position.passNothing.long"))
    expect(screen.getByText("input.no_match_title")).toBeInTheDocument()
    fireEvent.click(screen.getByText("input.clear_filters"))
    expect(screen.getAllByRole("article")).toHaveLength(4)
  })

  it("narrows by account type", async () => {
    render(<PublicInput items={many(6)} loading={false} />)
    // many(): every third author, from the first, is an organization.
    fireEvent.click(screen.getByLabelText("input.filter_by_account_type"))
    fireEvent.click(
      within(await screen.findByRole("menu")).getByText(
        "input.account_organization"
      )
    )
    expect(screen.getAllByRole("article")).toHaveLength(2)
  })

  describe("the reader's own input", () => {
    const asReader = (items: ConferenceTestimony[], uid = "u6") =>
      render(
        <InputContext.Provider
          value={{
            uid,
            subject: "",
            followed: new Set(),
            signedIn: true,
            byId: new Map(items.map(x => [x.id, x]))
          }}
        >
          <PublicInput items={items} loading={false} />
        </InputContext.Provider>
      )

    it("stands first, once, and marked as theirs", () => {
      asReader(many(7))
      const cards = screen.getAllByRole("article")
      expect(cards).toHaveLength(6)
      expect(cards[0]).toHaveTextContent("Words 6")
      expect(within(cards[0]).getByText("input.you")).toBeInTheDocument()
      // The clamp keeps a hidden copy of the words to measure, so count cards.
      expect(cards.filter(c => /Words 6/.test(c.textContent!))).toHaveLength(1)
    })

    it("stays first on every page, outside the five", () => {
      asReader(many(12))
      fireEvent.click(screen.getByRole("button", { name: "3" }))
      const cards = screen.getAllByRole("article")
      expect(cards[0]).toHaveTextContent("Words 6")
      // Eleven others, five a page: the third page has one.
      expect(cards).toHaveLength(2)
    })

    it("stays when a filter would leave it out", async () => {
      asReader(many(6).map(x => ({ ...x, position: "passSomething" as const })))
      fireEvent.click(screen.getByLabelText("input.filter_by_position"))
      fireEvent.click(
        within(await screen.findByRole("menu")).getByText(
          "input.position.passNothing.long"
        )
      )
      const cards = screen.getAllByRole("article")
      expect(cards).toHaveLength(1)
      expect(cards[0]).toHaveTextContent("Words 6")
      expect(screen.getByText("input.no_match_title")).toBeInTheDocument()
    })

    it("has no empty state when it is the only input", () => {
      asReader([entry(6)])
      expect(screen.getAllByRole("article")).toHaveLength(1)
      expect(screen.queryByText("input.empty_title")).not.toBeInTheDocument()
    })
  })

  describe("cosigning", () => {
    const org = entry(1, { authorRole: "organization" })
    const person = entry(2)
    const legislator = entry(3, { authorRole: "legislator" })
    const cosign = entry(4, { cosignOfId: "t1", cosignOfAuthorUid: "u1" })
    const own = entry(5, { authorUid: "me" })
    const items = [org, person, legislator, cosign, own]

    const show = (onCosign?: (t: ConferenceTestimony) => void) =>
      mount(items, { uid: "me", onCosign })

    const cosignable = () =>
      screen
        .getAllByRole("article")
        .filter(a => within(a).queryByRole("button", { name: "input.cosign" }))
        .map(authorOf)
        .sort()

    it("offers an individual's or an organization's input, not a legislator's, a cosign or your own", () => {
      const onCosign = jest.fn()
      show(onCosign)
      expect(cosignable()).toEqual(["Author 1", "Author 2"])
      fireEvent.click(
        within(cardOf("Author 1")).getByRole("button", { name: "input.cosign" })
      )
      expect(onCosign).toHaveBeenCalledWith(org)
    })

    it("offers nothing while the page does not", () => {
      show()
      expect(cosignable()).toEqual([])
    })

    it("lists a cosign under what it cosigns, without naming it again", () => {
      show()
      expect(screen.getAllByRole("article")).toHaveLength(4)
      const row = within(within(cardOf("Author 1")).getByRole("listitem"))
      expect(row.getByText("Author 4")).toBeInTheDocument()
      expect(row.getByText("input.cosigned")).toBeInTheDocument()
      expect(
        row.queryByRole("button", { name: "Author 1" })
      ).not.toBeInTheDocument()
    })

    it("says so where a cosign has no words of its own", () => {
      mount([{ ...cosign, content: "" }], {
        signedIn: false,
        byId: new Map([[org.id, org]])
      })
      expect(screen.getByText("input.cosign_no_words")).toBeInTheDocument()
    })
  })

  describe("cosigns under their card", () => {
    const at = (n: number) => ({ toDate: () => new Date(2026, 9, n) })
    const band = (text: string) =>
      screen.getByText(
        (_, el) => el?.tagName === "SPAN" && !!el.textContent?.startsWith(text)
      )

    const authors = () => screen.getAllByRole("article").map(authorOf)

    const rows = (author: string) =>
      within(cardOf(author)).queryAllByRole("listitem")

    it("brings a card up to its latest cosign", () => {
      mount([entry(1), entry(2), cosignOf(3, 1)])
      expect(authors()).toEqual(["Author 1", "Author 2"])
      expect(rows("Author 1")).toHaveLength(1)
    })

    it("ranks by the tally's date where the cosign is not listed", () => {
      mount([entry(1, { lastCosignedAt: at(9) } as any), entry(2)])
      expect(authors()).toEqual(["Author 1", "Author 2"])
    })

    it("stands a cosign alone when its card is not here", () => {
      mount([entry(1), cosignOf(2, 9)])
      expect(screen.getAllByRole("article")).toHaveLength(2)
    })

    it("pages by card, with its cosigns", () => {
      mount([...many(7), cosignOf(8, 1), cosignOf(9, 2), cosignOf(10, 3)])
      expect(screen.getAllByRole("article")).toHaveLength(5)
    })

    it("shows the band and the floor on a cosigned card, with Cosign in the band", () => {
      const onCosign = jest.fn()
      const card = entry(1, {
        cosignCount: 2,
        lastCosignedAt: at(4)
      } as any)
      mount([card, cosignOf(2, 1), cosignOf(3, 1, { authorUid: "me" })], {
        uid: "me",
        onCosign
      })
      expect(band("2 input.cosign_count 2")).toBeInTheDocument()
      expect(screen.getByText("input.cosign_view_yours")).toBeInTheDocument()
      expect(
        screen.getAllByRole("button", { name: "input.cosign" })
      ).toHaveLength(1)
    })

    it("shows no district counts on the floor, even when the card carries them", () => {
      mount([
        entry(1, {
          cosignCount: 1,
          cosignSenateDistrictCount: 1,
          cosignHouseDistrictCount: 1
        } as any)
      ])
      expect(band("1 input.cosign_count 1")).toBeInTheDocument()
      expect(screen.queryByText(/cosign_senate|cosign_house/)).toBeNull()
    })

    it("leaves a cosign without words out until asked, and counts it anyway", async () => {
      const card = entry(1, { cosignCount: 2 } as any)
      mount([
        card,
        entry(2),
        entry(3),
        cosignOf(4, 1),
        cosignOf(5, 1, { content: "" })
      ])
      expect(rows("Author 1")).toHaveLength(1)
      expect(band("2 input.cosign_count 2")).toBeInTheDocument()
      fireEvent.click(screen.getByLabelText("input.filters"))
      fireEvent.click(
        within(await screen.findByRole("menu")).getByText(
          "input.cosign_wordless"
        )
      )
      expect(rows("Author 1")).toHaveLength(2)
      expect(screen.getByText("input.cosign_no_words")).toBeInTheDocument()
    })

    it("keeps a card whose cosign matches a filter", async () => {
      mount([entry(1), entry(2), entry(3), cosignOf(4, 1)], {
        followed: new Set(["u4"])
      })
      fireEvent.click(screen.getByLabelText("input.filters"))
      fireEvent.click(
        within(await screen.findByRole("menu")).getByText("Author 4")
      )
      expect(authors()).toEqual(["Author 1"])
      expect(rows("Author 1")).toHaveLength(1)
    })

    it("shows three cosigns and the rest on request", () => {
      mount([
        entry(1),
        cosignOf(2, 1),
        cosignOf(3, 1),
        cosignOf(4, 1),
        cosignOf(5, 1)
      ])
      // Three cosigns and the control for the fourth.
      expect(rows("Author 1")).toHaveLength(4)
      fireEvent.click(screen.getByText("input.cosign_more 1"))
      expect(rows("Author 1")).toHaveLength(5)
      expect(screen.getByText("input.cosign_fewer")).toBeInTheDocument()
    })
  })

  describe("the reader's own cosign", () => {
    // Oldest of the cosigns on Author 1, so only the rule puts it first.
    const mine = cosignOf(20, 1, {
      authorUid: "me",
      publishedAt: { toDate: () => new Date(2026, 8, 1) }
    } as any)
    const others = [2, 3, 4, 5].map(n => cosignOf(n + 10, 1))
    const feed = [...many(12), ...others, mine]

    const asReader = (items: ConferenceTestimony[]) =>
      mount(items, { uid: "me" })
    const rowsOf = () => within(cardOf("Author 1")).queryAllByRole("listitem")

    it("stands its card first on every page, and its own first under it", () => {
      asReader(feed)
      expect(screen.getAllByRole("article")[0]).toBe(cardOf("Author 1"))
      expect(rowsOf()[0]).toHaveTextContent("Author 20")
      fireEvent.click(screen.getByRole("button", { name: "3" }))
      expect(screen.getAllByRole("article")[0]).toBe(cardOf("Author 1"))
    })

    it("shows once, marked as theirs on its row and not on the card", () => {
      asReader(feed)
      expect(screen.getAllByText("Author 20")).toHaveLength(1)
      expect(screen.getAllByText("input.you")).toHaveLength(1)
      expect(within(rowsOf()[0]).getByText("input.you")).toBeInTheDocument()
      expect(rowsOf()[0]).toHaveAttribute("id", "your-input")
      expect(cardOf("Author 1").closest("#your-input")).toBeNull()
    })

    it("stays when a filter would leave its card out", async () => {
      asReader(feed.map(x => ({ ...x, position: "passSomething" as const })))
      fireEvent.click(screen.getByLabelText("input.filter_by_position"))
      fireEvent.click(
        within(await screen.findByRole("menu")).getByText(
          "input.position.passNothing.long"
        )
      )
      expect(screen.getAllByRole("article")).toHaveLength(1)
      expect(rowsOf()[0]).toHaveTextContent("Author 20")
    })

    it("shows without words while others without words wait", () => {
      asReader([
        ...feed.filter(x => x !== mine),
        { ...mine, content: "" },
        cosignOf(30, 1, { content: "" })
      ])
      expect(rowsOf()[0]).toHaveTextContent("input.cosign_no_words")
      expect(screen.getAllByText("input.cosign_no_words")).toHaveLength(1)
    })

    it("stands alone, marked, where its card is not here", () => {
      asReader([entry(2), cosignOf(3, 9, { authorUid: "me" })])
      const cards = screen.getAllByRole("article")
      expect(cards[0]).toHaveTextContent("Author 3")
      expect(within(cards[0]).getByText("input.you")).toBeInTheDocument()
    })
  })
})
