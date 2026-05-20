import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import { BallotQuestionDetails } from "./BallotQuestionDetails"

const mockUsePublishedTestimonyListing = jest.fn(() => ({
  items: { result: [] },
  pagination: {}
}))

jest.mock("../db", () => ({
  usePublishedTestimonyListing: () => mockUsePublishedTestimonyListing()
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
  TestimoniesTab: ({
    testimonySummary
  }: {
    testimonySummary: {
      testimonyCount: number
      endorseCount: number
      neutralCount: number
      opposeCount: number
    }
  }) => (
    <div>
      Summary {testimonySummary.testimonyCount}/{testimonySummary.endorseCount}/
      {testimonySummary.neutralCount}/{testimonySummary.opposeCount}
    </div>
  )
}))

let mockPanelStatus: "published" | "createInProgress" | "editInProgress" =
  "published"
let mockPublication:
  | { position?: "endorse" | "neutral" | "oppose"; version?: number }
  | undefined = undefined

jest.mock("../publish/hooks", () => ({
  usePanelStatus: () => mockPanelStatus,
  usePublishState: () => ({ publication: mockPublication })
}))

jest.mock("../firebase", () => ({
  firestore: {}
}))

const mockGetDoc = jest.fn((..._args: unknown[]) => new Promise(() => {}))
const mockDoc = jest.fn((..._args: unknown[]) => ({}))

jest.mock("firebase/firestore", () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args)
}))

const defaultProps = {
  ballotQuestion: { id: "25-15" } as any,
  bill: null,
  hearings: [],
  testimonySummary: {
    testimonyCount: 3,
    endorseCount: 1,
    neutralCount: 1,
    opposeCount: 1
  }
}

describe("BallotQuestionDetails", () => {
  beforeEach(() => {
    mockPanelStatus = "published"
    mockPublication = undefined
    mockGetDoc.mockClear()
    mockDoc.mockClear()
  })

  it("passes the testimony count through to the ballot-question nav", () => {
    render(<BallotQuestionDetails {...defaultProps} />)

    expect(screen.getByText("Nav 3")).toBeInTheDocument()
  })

  it("optimistically increments counts after a new perspective is published", async () => {
    const { rerender } = render(<BallotQuestionDetails {...defaultProps} />)

    mockPanelStatus = "createInProgress"
    rerender(<BallotQuestionDetails {...defaultProps} />)

    mockPanelStatus = "published"
    mockPublication = { position: "endorse", version: 1 }
    rerender(<BallotQuestionDetails {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText("Nav 4")).toBeInTheDocument()
    })
  })

  it("optimistically swaps buckets when an existing perspective changes position", async () => {
    const { rerender } = render(<BallotQuestionDetails {...defaultProps} />)

    mockPanelStatus = "editInProgress"
    mockPublication = { position: "endorse", version: 1 }
    rerender(<BallotQuestionDetails {...defaultProps} />)

    mockPanelStatus = "published"
    mockPublication = { position: "oppose", version: 2 }
    rerender(<BallotQuestionDetails {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText("Nav 3")).toBeInTheDocument()
    })
  })
})
