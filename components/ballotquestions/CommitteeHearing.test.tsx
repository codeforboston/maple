import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { CommitteeHearing } from "./CommitteeHearing"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const messages: Record<string, string> = {
        "committeeHearing.description":
          "Committee hearings are public meetings.",
        "committeeHearing.imageAlt": "Committee hearing",
        "committeeHearing.openPage": "Open hearing page",
        "committeeHearing.title": "Committee Hearing"
      }
      return messages[key] ?? key
    }
  })
}))

const PAST_MS = new Date("2025-12-14T14:00:00Z").getTime()
const FUTURE_MS = new Date("2030-06-01T10:00:00Z").getTime()

describe("CommitteeHearing", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-01-01T00:00:00Z"))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("shows hearing context copy", () => {
    render(
      <CommitteeHearing
        hearing={{ id: "1", startsAt: FUTURE_MS, videoURLs: [] }}
      />
    )
    expect(screen.getByText("Committee Hearing")).toBeInTheDocument()
    expect(
      screen.getByText("Committee hearings are public meetings.")
    ).toBeInTheDocument()
  })

  it("formats the hearing date", () => {
    render(
      <CommitteeHearing
        hearing={{ id: "1", startsAt: PAST_MS, videoURLs: [] }}
      />
    )
    expect(screen.getByText(/December 14, 2025/)).toBeInTheDocument()
  })

  it("shows a hearing page link when an id is present", () => {
    render(
      <CommitteeHearing
        hearing={{ id: "hearing-1", startsAt: PAST_MS, videoURLs: [] }}
      />
    )
    expect(
      screen.getByRole("link", { name: /Open hearing page/i })
    ).toHaveAttribute("href", "/hearing/1")
  })

  it("hides the hearing page link when no hearing id is available", () => {
    render(
      <CommitteeHearing
        hearing={{ id: "", startsAt: PAST_MS, videoURLs: [] }}
      />
    )
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })
})
