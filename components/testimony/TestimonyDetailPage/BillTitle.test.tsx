import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { BillTitle } from "./BillTitle"

jest.mock("components/links", () => ({
  Internal: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
  maple: {
    ballotQuestion: ({ id }: { id: string }) => `/ballotQuestions/${id}`,
    bill: ({ court, id }: { court: number; id: string }) =>
      `/bills/${court}/${id}`
  }
}))

jest.mock("./testimonyDetailSlice", () => ({
  useCurrentTestimonyDetails: () => ({
    bill: {
      id: "H123",
      court: 194,
      content: {
        BillNumber: "H123",
        Title: "A bill title"
      }
    },
    ballotQuestion: {
      id: "25-14",
      title: "Should we do the thing?",
      description: null
    }
  })
}))

describe("BillTitle", () => {
  it("shows the ballot question title for ballot-question testimony", () => {
    render(<BillTitle />)

    expect(
      screen.getByRole("link", {
        name: "Ballot Question 25-14: Should we do the thing?"
      })
    ).toHaveAttribute("href", "/ballotQuestions/25-14")
  })
})
