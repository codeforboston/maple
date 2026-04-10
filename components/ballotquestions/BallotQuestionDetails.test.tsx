import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { BallotQuestionDetails } from "./BallotQuestionDetails"

jest.mock("../db", () => ({
  usePublishedTestimonyListing: () => ({
    items: { result: [] },
    pagination: {}
  })
}))

jest.mock("./BallotQuestionHeader", () => ({
  BallotQuestionHeader: () => <div>Header</div>
}))

jest.mock("./BallotQuestionNav", () => ({
  BallotQuestionNav: ({ testimonyCount }: { testimonyCount?: number }) => (
    <div>Nav {testimonyCount}</div>
  )
}))

jest.mock("./OverviewTab", () => ({
  OverviewTab: () => <div>Overview</div>
}))

jest.mock("./TestimoniesTab", () => ({
  TestimoniesTab: () => <div>Testimonies</div>
}))

describe("BallotQuestionDetails", () => {
  it("passes the testimony count through to the ballot-question nav", () => {
    render(
      <BallotQuestionDetails
        ballotQuestion={{ id: "25-15" } as any}
        bill={null}
        hearings={[]}
        testimonySummary={{
          testimonyCount: 3,
          endorseCount: 1,
          neutralCount: 1,
          opposeCount: 1
        }}
      />
    )

    expect(screen.getByText("Nav 3")).toBeInTheDocument()
  })
})
