import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { BallotQuestionNav } from "./BallotQuestionNav"
import { OverviewTab } from "./OverviewTab"
import { TestimoniesTab } from "./TestimoniesTab"

jest.mock("../TestimonyCard/ViewTestimony", () => () => (
  <div data-testid="view-testimony" />
))

const ballotQuestion = {
  id: "25-15",
  ballotStatus: "legislature",
  ballotQuestionNumber: null,
  atAGlance: null,
  fullSummary: "Summary"
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

  it("links the testimonies tab to legislature-phase testimony without bill wording", () => {
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

    const link = screen.getByRole("link", {
      name: "View legislature-phase testimony"
    })

    expect(link).toHaveAttribute("href", "/bills/194/H5005#testimonies")
    expect(
      screen.queryByText("View the related bill to read legislative testimony.")
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
    expect(screen.getByText("Testimonies")).toBeInTheDocument()
    expect(screen.queryByText("Synthesis & Insights")).not.toBeInTheDocument()
    expect(screen.queryByText("For & Against")).not.toBeInTheDocument()
    expect(screen.queryByText("News & Media")).not.toBeInTheDocument()
    expect(screen.queryByText("Academia")).not.toBeInTheDocument()
    expect(screen.queryByText("Campaign Financials")).not.toBeInTheDocument()
    expect(screen.queryByText("Map")).not.toBeInTheDocument()
  })
})
