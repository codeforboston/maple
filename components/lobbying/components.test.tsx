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
    generalCourt: 194,
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

  it("sorts by organization and by filings", async () => {
    const filings = [
      { ...filing, clientName: "Beta Org", clientNameNorm: "beta org" },
      { ...filing, clientName: "Alpha Org", clientNameNorm: "alpha org" },
      { ...filing, clientName: "Beta Org", clientNameNorm: "beta org" }
    ]
    render(
      <ActivityTable
        by="client"
        data={groupActivity(filings, "client", {}, {})}
      />
    )
    const labels = () =>
      screen
        .getAllByRole("button", { name: /showFilers/ })
        .map(b => b.getAttribute("aria-label"))
    expect(labels()).toEqual([
      "activity.showFilers(Alpha Org)",
      "activity.showFilers(Beta Org)"
    ])

    await userEvent.click(
      screen.getByRole("button", { name: /fields.filings/ })
    )
    expect(labels()).toEqual([
      "activity.showFilers(Beta Org)",
      "activity.showFilers(Alpha Org)"
    ])

    await userEvent.click(
      screen.getByRole("button", { name: /activity.column.client/ })
    )
    await userEvent.click(
      screen.getByRole("button", { name: /activity.column.client/ })
    )
    expect(labels()).toEqual([
      "activity.showFilers(Beta Org)",
      "activity.showFilers(Alpha Org)"
    ])
  })

  it("toggles a row from a click anywhere on it, but not from its link", async () => {
    render(
      <ActivityTable
        by="client"
        data={groupActivity([filing], "client", {}, {})}
        rowHref={() => "#widget-co"}
      />
    )
    const toggle = screen.getByRole("button", { name: /showFilers/ })

    await userEvent.click(screen.getByText("activity.filings(1)"))
    expect(toggle).toHaveAttribute("aria-expanded", "true")

    await userEvent.click(screen.getByText("activity.filings(1)"))
    expect(toggle).toHaveAttribute("aria-expanded", "false")

    await userEvent.click(screen.getByRole("link", { name: "Widget Co" }))
    expect(toggle).toHaveAttribute("aria-expanded", "false")

    // The button's own click toggles once, not twice.
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
  })

  it("lists every period for each filer, with an empty square when they didn't file", async () => {
    const filings = [
      filing,
      {
        ...filing,
        periodEnd: "2025-12-31",
        disclosureUrl: "https://sos.example/d2"
      },
      {
        ...filing,
        entityName: "Staffer",
        entityNameNorm: "staffer",
        position: "Oppose",
        disclosureUrl: "https://sos.example/d3"
      }
    ]
    // The 194th's periods that have ended by then: Jan–Jun 2025 through
    // Jan–Jun 2026.
    jest.useFakeTimers({ now: new Date("2026-10-23"), advanceTimers: true })
    let squares: (string | null)[]
    try {
      render(
        <ActivityTable
          by="client"
          data={groupActivity(filings, "client", {}, {})}
        />
      )
      await userEvent.click(screen.getByRole("button", { name: /showFilers/ }))
      squares = screen
        .getAllByRole("img")
        .map(el => el.getAttribute("aria-label"))
    } finally {
      jest.useRealTimers()
    }
    // Each filer gets every period, newest first, empty where they didn't
    // file (no one filed in Jan–Jun 2026; Staffer not in Jul–Dec 2025).
    expect(squares).toEqual([
      "activity.periodPosition(Jan–Jun 2026|activity.noFiling)",
      "activity.periodPosition(Jul–Dec 2025|position.support)",
      "activity.periodPosition(Jan–Jun 2025|position.support)",
      "activity.periodPosition(Jan–Jun 2026|activity.noFiling)",
      "activity.periodPosition(Jul–Dec 2025|activity.noFiling)",
      "activity.periodPosition(Jan–Jun 2025|position.oppose)"
    ])
  })
})
