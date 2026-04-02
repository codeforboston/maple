import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { BallotQuestionNav } from "./BallotQuestionNav"
import { OverviewTab } from "./OverviewTab"
import { TestimoniesTab } from "./TestimoniesTab"

jest.mock("../TestimonyCard/ViewTestimony", () => {
  const MockViewTestimony = () => <div data-testid="view-testimony" />

  MockViewTestimony.displayName = "MockViewTestimony"

  return MockViewTestimony
})

const ballotQuestion = {
  id: "25-15",
  ballotStatus: "legislature",
  ballotQuestionNumber: null,
  atAGlance: null,
  fullSummary: "Summary"
} as any

const ballotPhaseQuestion = {
  ...ballotQuestion,
  ballotStatus: "ballot"
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

  it("shows the legislature-phase bill submission link in legislature phase", () => {
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
      name: "related bill"
    })

    expect(link).toHaveAttribute("href", "/bills/194/H5005")
    expect(
      screen.getByText(/This petition is still before the legislature\./)
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/You can review testimony on the related bill/)
    ).not.toBeInTheDocument()
  })

  it("links to legislature-phase testimony during ballot phase", () => {
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

    const link = screen.getByRole("link", { name: "here" })

    expect(link).toHaveAttribute("href", "/bills/194/H5005#testimonies")
    expect(
      screen.getByText(/You can review testimony on the related bill/)
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/This petition is still before the legislature\./)
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
