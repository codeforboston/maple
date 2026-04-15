import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import ViewTestimony from "./ViewTestimony"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ((
        {
          "ballotQuestion.viewTestimony.allPerspectives": "All Perspectives",
          "ballotQuestion.viewTestimony.browsePerspectives":
            "Browse Perspectives",
          "ballotQuestion.viewTestimony.noPerspectives":
            "There are no perspectives"
        } as Record<string, string>
      )[key] ?? key)
  })
}))

jest.mock("../auth", () => ({
  useAuth: () => ({ user: null })
}))

const emptyListing = {
  items: { result: [] },
  setFilter: jest.fn(),
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    hasPreviousPage: false,
    hasNextPage: false
  }
} as any

describe("ViewTestimony", () => {
  it("keeps testimony copy for default testimony lists", () => {
    render(<ViewTestimony {...emptyListing} />)

    expect(screen.getByText("All Testimonies")).toBeInTheDocument()
    expect(screen.queryByText("All Perspectives")).not.toBeInTheDocument()
  })

  it("uses perspective copy for ballot-question testimony lists", () => {
    render(<ViewTestimony {...emptyListing} variant="ballotQuestion" />)

    expect(screen.getByText("All Perspectives")).toBeInTheDocument()
    expect(screen.getByText("Browse Perspectives")).toBeInTheDocument()
    expect(screen.getByText("There are no perspectives")).toBeInTheDocument()
  })
})
