import "@testing-library/jest-dom"
import { fireEvent, render, screen, within } from "@testing-library/react"
import type { ConferenceTestimony } from "components/db"
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
})
