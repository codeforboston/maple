import "@testing-library/jest-dom"
import { fireEvent, render, screen } from "@testing-library/react"

import { LegislatorTabs } from "./LegislatorTabs"

const push = jest.fn().mockResolvedValue(true)
let mockRouter = {
  asPath: "/legislators/194/ABC1",
  isReady: true,
  push
}

jest.mock("next/router", () => ({
  useRouter: () => mockRouter
}))

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        "tabs.priorities": "Priorities",
        "tabs.bills": "Bills",
        "tabs.elections": "Elections",
        "tabs.finance": "Campaign Finance",
        "tabs.district": "District",
        "tabs.testimony": "Testimony",
        "tabs.votes": "Votes"
      }[key] ?? key)
  })
}))

jest.mock("./TabComponents/PrioritiesTab", () => ({
  PrioritiesTab: () => null
}))
jest.mock("./TabComponents/BillsTab", () => ({
  BillsTab: () => null
}))
jest.mock("./TabComponents/ElectionsTab", () => ({
  ElectionsTab: () => null
}))
jest.mock("./TabComponents/FinanceTab", () => ({
  FinanceTab: () => null
}))
jest.mock("./TabComponents/DistrictTab", () => ({
  DistrictTab: () => null
}))
jest.mock("./TabComponents/TestimonyTab", () => ({
  TestimonyTab: () => null
}))
jest.mock("./TabComponents/VotesTab", () => ({
  VotesTab: () => null
}))

const renderTabs = () =>
  render(<LegislatorTabs legislatorId="legislator-id" name="Test Legislator" />)

describe("LegislatorTabs", () => {
  beforeEach(() => {
    push.mockClear()
    mockRouter = {
      asPath: "/legislators/194/ABC1",
      isReady: true,
      push
    }
  })

  it("selects the tab from the URL hash after the router is ready", () => {
    mockRouter = {
      ...mockRouter,
      asPath: "/legislators/194/ABC1#elections",
      isReady: false
    }
    const { rerender } = renderTabs()

    expect(screen.getByRole("tab", { name: "Priorities" })).toHaveAttribute(
      "aria-selected",
      "true"
    )

    mockRouter = { ...mockRouter, isReady: true }
    rerender(
      <LegislatorTabs legislatorId="legislator-id" name="Test Legislator" />
    )

    expect(screen.getByRole("tab", { name: "Elections" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
  })

  it.each([
    "/legislators/194/ABC1",
    "/legislators/194/ABC1#not-a-legislator-tab"
  ])("falls back to priorities for %s", asPath => {
    mockRouter = { ...mockRouter, asPath }
    renderTabs()

    expect(screen.getByRole("tab", { name: "Priorities" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
  })

  it("adds the selected tab to the URL hash", () => {
    renderTabs()

    fireEvent.click(screen.getByRole("tab", { name: "Campaign Finance" }))

    expect(
      screen.getByRole("tab", { name: "Campaign Finance" })
    ).toHaveAttribute("aria-selected", "true")
    expect(push).toHaveBeenCalledWith(
      "/legislators/194/ABC1#finance",
      undefined,
      { shallow: true, scroll: false }
    )
  })

  it("updates the selected tab when browser history changes the hash", () => {
    mockRouter = {
      ...mockRouter,
      asPath: "/legislators/194/ABC1#elections"
    }
    const { rerender } = renderTabs()

    expect(screen.getByRole("tab", { name: "Elections" })).toHaveAttribute(
      "aria-selected",
      "true"
    )

    mockRouter = { ...mockRouter, asPath: "/legislators/194/ABC1#bills" }
    rerender(
      <LegislatorTabs legislatorId="legislator-id" name="Test Legislator" />
    )

    expect(screen.getByRole("tab", { name: "Bills" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
  })
})
