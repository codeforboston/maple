import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { BrowseBallotQuestions } from "./BrowseBallotQuestions"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const messages: Record<string, string> = {
        ballot_question_search_label: "Search",
        ballot_question_search_placeholder: "Search title or final summary",
        ballot_question_filter_year: "Year",
        ballot_question_filter_court: "Court",
        ballot_question_filter_status: "Status",
        ballot_question_all_years: "All years",
        ballot_question_all_courts: "All courts",
        ballot_question_all_statuses: "All statuses",
        ballot_question_no_results:
          "No ballot questions match the current filters.",
        ballot_question_document_id: `Document ID: ${params?.id ?? ""}`,
        ballot_question_election_year: `Election ${params?.year ?? ""}`,
        ballot_question_court: `Court ${params?.court ?? ""}`,
        "counts.endorsements.alt": "Endorsements",
        "counts.neutral.alt": "Neutral",
        "counts.oppose.alt": "Oppositions"
      }
      return messages[key] ?? key
    }
  })
}))

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

const items = [
  {
    id: "25-15",
    title: "Nature for All",
    fullSummary: "Conserves land and expands access to nature.",
    electionYear: 2026,
    court: 194,
    ballotStatus: "legislature" as const,
    endorseCount: 1,
    neutralCount: 0,
    opposeCount: 0
  },
  {
    id: "25-22",
    title: "Collective Bargaining",
    fullSummary: "Public counsel labor rights question.",
    electionYear: 2026,
    court: 194,
    ballotStatus: "ballot" as const,
    endorseCount: 2,
    neutralCount: 1,
    opposeCount: 0
  },
  {
    id: "23-12",
    title: "Tipped Wage",
    fullSummary: "Raises the tipped minimum wage over time.",
    electionYear: 2024,
    court: 193,
    ballotStatus: "failed" as const,
    endorseCount: 3,
    neutralCount: 0,
    opposeCount: 1
  }
]

describe("BrowseBallotQuestions", () => {
  it("defaults to the current year and can switch to another year", () => {
    render(<BrowseBallotQuestions items={items} currentYear={2026} />)

    expect(screen.getByRole("combobox", { name: "Year" })).toHaveValue("2026")
    expect(screen.getByText("Nature for All")).toBeInTheDocument()
    expect(screen.getByText("Collective Bargaining")).toBeInTheDocument()
    expect(screen.queryByText("Tipped Wage")).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole("combobox", { name: "Year" }), {
      target: { value: "2024" }
    })

    expect(screen.getByText("Tipped Wage")).toBeInTheDocument()
    expect(screen.queryByText("Nature for All")).not.toBeInTheDocument()
  })

  it("filters by court and status and searches title and final summary", async () => {
    render(<BrowseBallotQuestions items={items} currentYear={2026} />)

    fireEvent.change(screen.getByRole("combobox", { name: "Status" }), {
      target: { value: "ballot" }
    })

    expect(screen.getByText("Collective Bargaining")).toBeInTheDocument()
    expect(screen.queryByText("Nature for All")).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole("combobox", { name: "Court" }), {
      target: { value: "194" }
    })
    fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), {
      target: { value: "labor rights" }
    })

    await waitFor(() => {
      expect(screen.getByText("Collective Bargaining")).toBeInTheDocument()
    })

    fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), {
      target: { value: "nature" }
    })

    await waitFor(() => {
      expect(
        screen.getByText("No ballot questions match the current filters.")
      ).toBeInTheDocument()
    })
  })

  it("can search across older years after widening the year filter", async () => {
    render(<BrowseBallotQuestions items={items} currentYear={2026} />)

    fireEvent.change(screen.getByRole("combobox", { name: "Year" }), {
      target: { value: "all" }
    })
    fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), {
      target: { value: "tipped minimum wage" }
    })

    await waitFor(() => {
      expect(screen.getByText("Tipped Wage")).toBeInTheDocument()
    })
    expect(screen.queryByText("Nature for All")).not.toBeInTheDocument()
  })
})
