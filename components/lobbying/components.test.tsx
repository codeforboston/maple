import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { groupActivity, type ActivityFiling } from "./activity"
import { ActivityTable } from "./ActivityTable"
import { PositionBar } from "./PositionBar"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts ? `${key}(${Object.values(opts).join("|")})` : key
  })
}))

describe("PositionBar", () => {
  it("labels the bar with every count and titles each segment", () => {
    render(<PositionBar counts={{ support: 2, oppose: 1, neutral: 0 }} />)
    const bar = screen.getByRole("img")
    expect(bar.getAttribute("aria-label")).toContain("position.support|2")
    expect(bar.getAttribute("aria-label")).toContain("position.oppose|1")
    expect(bar.children).toHaveLength(2)
  })

  it("shows a dash when there are no counts", () => {
    render(<PositionBar counts={{ support: 0, oppose: 0, neutral: 0 }} />)
    expect(screen.getByText("—")).toBeInTheDocument()
  })
})

describe("ActivityTable", () => {
  const filing: ActivityFiling = {
    registrantId: "r1",
    entityName: "Acme Lobbying",
    entityNameNorm: "acme lobbying",
    clientName: "Widget Co",
    clientNameNorm: "widget co",
    year: 2025,
    billId: "H100",
    activityTitle: "An Act relative to widgets",
    position: "Support",
    disclosureUrl: "https://sos.example/d1",
    periodEnd: "2025-06-30"
  }

  it("expands a row from the keyboard to show its filers", async () => {
    render(
      <ActivityTable
        by="client"
        data={groupActivity([filing], "client", {}, {})}
      />
    )
    const toggle = screen.getByRole("button", { name: /showFilers/ })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    const panelId = toggle.getAttribute("aria-controls")!
    expect(document.getElementById(panelId)).toBeNull()

    toggle.focus()
    await userEvent.keyboard("{Enter}")

    expect(toggle).toHaveAttribute("aria-expanded", "true")
    const panel = document.getElementById(toggle.getAttribute("aria-controls")!)
    expect(panel).toHaveTextContent("Acme Lobbying")
    expect(panel).toHaveTextContent("Jan–Jun 2025")
    expect(
      screen.getByRole("link", { name: /viewOnSosLabel/ })
    ).toHaveAttribute("href", "https://sos.example/d1")
  })
})
