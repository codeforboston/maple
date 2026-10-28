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

const many = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    entry(i + 1, {
      position: i % 2 ? "passNothing" : "passSomething",
      authorRole: i % 3 ? "user" : "organization"
    })
  )

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

  describe("cosigning", () => {
    const org = entry(1, { authorRole: "organization" })
    const person = entry(2)
    const legislator = entry(3, { authorRole: "legislator" })
    const cosign = entry(4, { cosignOfId: "t1", cosignOfAuthorUid: "u1" })
    const own = entry(5, { authorUid: "me" })
    const items = [org, person, legislator, cosign, own]

    const mount = (onCosign?: (t: ConferenceTestimony) => void) =>
      render(
        <InputContext.Provider
          value={{
            uid: "me",
            subject: "Phone-Free Schools",
            followed: new Set(),
            signedIn: true,
            onCosign,
            byId: new Map(items.map(x => [x.id, x]))
          }}
        >
          <PublicInput items={items} loading={false} />
        </InputContext.Provider>
      )

    const cosignable = () =>
      screen
        .getAllByRole("article")
        .filter(a => within(a).queryByRole("button", { name: "input.cosign" }))
        .map(a => a.querySelector("p span")?.textContent)

    it("offers an individual's or an organization's input, not a legislator's, a cosign or your own", () => {
      const onCosign = jest.fn()
      mount(onCosign)
      expect(cosignable()).toEqual(["Author 1", "Author 2"])
      fireEvent.click(
        within(screen.getAllByRole("article")[0]).getByRole("button", {
          name: "input.cosign"
        })
      )
      expect(onCosign).toHaveBeenCalledWith(org)
    })

    it("offers nothing while the page does not", () => {
      mount()
      expect(cosignable()).toEqual([])
    })

    it("names what a cosign cosigns", () => {
      mount()
      const card = within(screen.getAllByRole("article")[3])
      expect(card.getByText("input.cosigned")).toBeInTheDocument()
      expect(card.getByRole("button", { name: "Author 1" })).toBeInTheDocument()
      expect(card.queryByText("input.cosign_no_words")).not.toBeInTheDocument()
    })

    it("says so where a cosign has no words of its own", () => {
      render(
        <InputContext.Provider
          value={{
            subject: "Phone-Free Schools",
            followed: new Set(),
            signedIn: false,
            byId: new Map([[org.id, org]])
          }}
        >
          <PublicInput items={[{ ...cosign, content: "" }]} loading={false} />
        </InputContext.Provider>
      )
      expect(screen.getByText("input.cosign_no_words")).toBeInTheDocument()
    })
  })
})
