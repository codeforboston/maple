import "@testing-library/jest-dom"
import { Timestamp } from "firebase/firestore"
import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { NewsfeedCard } from "./NewsfeedCard"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

jest.mock("components/links", () => ({
  Internal: ({
    href,
    children,
    className
  }: {
    href: string
    children: ReactNode
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  )
}))

describe("NewsfeedCard", () => {
  it("renders ballot-question updates with the follow reason and destination link", () => {
    render(
      <NewsfeedCard
        ballotQuestionId="25-14"
        ballotStatus="certified"
        bodyText=""
        header="Question 1: Should we do the thing?"
        isBallotQuestionMatch={true}
        timestamp={Timestamp.fromDate(new Date("2025-03-01"))}
        type="ballotQuestion"
      />
    )

    expect(screen.getByText("newsfeed.follow")).toBeInTheDocument()
    expect(
      screen.getAllByText("Question 1: Should we do the thing?")
    ).toHaveLength(2)
    expect(screen.getByText(/Status updated to:/)).toBeInTheDocument()
    expect(screen.getByText("certified")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "View ballot question" })
    ).toHaveAttribute("href", "/ballotQuestions/25-14")
  })
})
