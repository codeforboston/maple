import "@testing-library/jest-dom"
import { fireEvent, render, screen } from "@testing-library/react"
import { BallotQuestionNav } from "./BallotQuestionNav"
import { OverviewTab } from "./OverviewTab"
import { TestimoniesTab } from "./TestimoniesTab"

jest.mock("next-i18next", () => ({
  Trans: ({ i18nKey }: { i18nKey: string }) => <>{i18nKey}</>,
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const messages: Record<string, string> = {
        "nav.explore": "Explore",
        "nav.sectionsAriaLabel": "Ballot question sections",
        "tabs.overview": "Overview",
        "tabs.perspectives": "Perspectives",
        "tabs.forAndAgainst": "For & Against",
        "tabs.news": "News & Media",
        "tabs.academia": "Academia",
        "tabs.financials": "Campaign Financials",
        "tabs.map": "Map",
        "overview.title": "Overview",
        "overview.description":
          "Understand the question, key details, and ballot context.",
        "testimonies.title": "Perspectives",
        "testimonies.total": `${params?.count ?? 0} perspectives`,
        "testimonies.relatedBillPrefix":
          "You can review testimony on the related bill",
        "testimonies.relatedBillLink": "here",
        "testimonies.endorse": "Endorse",
        "testimonies.neutral": "Neutral",
        "testimonies.oppose": "Oppose"
      }
      return messages[key] ?? key
    }
  })
}))

jest.mock("../TestimonyCard/ViewTestimony", () => {
  const MockViewTestimony = () => <div data-testid="view-testimony" />

  MockViewTestimony.displayName = "MockViewTestimony"

  return MockViewTestimony
})

const ballotQuestion = {
  id: "25-15",
  ballotStatus: "expectedOnBallot",
  ballotQuestionNumber: null,
  atAGlance: null,
  fullSummary: "Summary"
} as any

const ballotPhaseQuestion = {
  ...ballotQuestion,
  ballotStatus: "failedToAppear"
} as any

const bill = {
  id: "H5005",
  court: 194
} as any

describe("Ballot question tab links", () => {
  it("does not show the corresponding bill link on the overview tab", () => {
    render(
      <OverviewTab ballotQuestion={ballotQuestion} bill={bill} hearings={[]} />
    )

    expect(screen.queryByText("View complete text")).not.toBeInTheDocument()
  })

  it("shows the bill submission link in expected-on-ballot phase", () => {
    render(
      <TestimoniesTab
        ballotQuestion={ballotQuestion}
        bill={bill}
        testimony={{ items: { result: [] }, pagination: {} } as any}
        testimonySummary={{
          testimonyCount: 0,
          endorseCount: 0,
          neutralCount: 0,
          opposeCount: 0
        }}
      />
    )

    const link = screen.getByRole("link", { name: "here" })

    expect(link).toHaveAttribute("href", "/bills/194/H5005#testimonies")
    expect(
      screen.getByText(/You can review testimony on the related bill/)
    ).toBeInTheDocument()
  })

  it("hides the bill submission note in terminal phases", () => {
    render(
      <TestimoniesTab
        ballotQuestion={ballotPhaseQuestion}
        bill={bill}
        testimony={{ items: { result: [] }, pagination: {} } as any}
        testimonySummary={{
          testimonyCount: 0,
          endorseCount: 0,
          neutralCount: 0,
          opposeCount: 0
        }}
      />
    )

    expect(screen.queryByRole("link", { name: "here" })).not.toBeInTheDocument()
    expect(
      screen.queryByText(/You can review testimony on the related bill/)
    ).not.toBeInTheDocument()
  })

  it("hides unused ballot question tabs", () => {
    render(
      <BallotQuestionNav
        activeTab="overview"
        onTabChange={jest.fn()}
        testimonyCount={5}
      />
    )

    expect(screen.getByText("Overview")).toBeInTheDocument()
    expect(screen.getByText("Perspectives")).toBeInTheDocument()
    expect(screen.queryByText("Synthesis & Insights")).not.toBeInTheDocument()
    expect(screen.queryByText("For & Against")).not.toBeInTheDocument()
    expect(screen.queryByText("News & Media")).not.toBeInTheDocument()
    expect(screen.queryByText("Academia")).not.toBeInTheDocument()
    expect(screen.queryByText("Campaign Financials")).not.toBeInTheDocument()
    expect(screen.queryByText("Map")).not.toBeInTheDocument()
  })

  it("exposes the ballot question navigation as tabs", () => {
    render(
      <BallotQuestionNav
        activeTab="overview"
        onTabChange={jest.fn()}
        testimonyCount={5}
      />
    )

    const tabs = screen.getAllByRole("tab")

    expect(screen.getByRole("tablist")).toBeInTheDocument()
    expect(tabs).toHaveLength(2)
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
    expect(screen.getByRole("tab", { name: /Perspectives/ })).toHaveAttribute(
      "aria-selected",
      "false"
    )
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-controls",
      "ballot-question-panel-overview"
    )
    expect(screen.getByRole("tab", { name: /Perspectives/ })).toHaveAttribute(
      "aria-controls",
      "ballot-question-panel-testimonies"
    )
  })

  it("shows campaign financials only when ballot question financial data exists", () => {
    render(
      <BallotQuestionNav
        activeTab="overview"
        onTabChange={jest.fn()}
        testimonyCount={5}
        showCampaignFinancials
      />
    )

    expect(
      screen.getByRole("tab", { name: "Campaign Financials" })
    ).toHaveAttribute("aria-controls", "ballot-question-panel-financials")
  })

  it("supports arrow-key navigation between ballot question tabs", () => {
    const onTabChange = jest.fn()

    render(
      <BallotQuestionNav
        activeTab="overview"
        onTabChange={onTabChange}
        testimonyCount={5}
      />
    )

    fireEvent.keyDown(screen.getByRole("tab", { name: "Overview" }), {
      key: "ArrowRight"
    })

    expect(onTabChange).toHaveBeenCalledWith("testimonies")
  })
})
