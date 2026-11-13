import "@testing-library/jest-dom"
import { Timestamp } from "firebase/firestore"
import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { NewsfeedCard } from "./NewsfeedCard"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

jest.mock("../featureFlags", () => ({
  flags: () => ({ ballotQuestions: true })
}))

jest.mock("components/links", () => ({
  maple: jest.requireActual("components/links").maple,
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

// jsdom has no matchMedia; the testimony bodies ask it for the phone layout
beforeAll(() => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  })
})

describe("NewsfeedCard", () => {
  it("renders ballot-question updates with the follow reason and destination link", () => {
    render(
      <NewsfeedCard
        ballotQuestionId="25-14"
        ballotStatus="expectedOnBallot"
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
    expect(screen.getByText("expectedOnBallot")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "View ballot question" })
    ).toHaveAttribute("href", "/ballotQuestions/25-14")
  })

  const testimony = {
    authorUid: "author1",
    billId: "S2581",
    bodyText: "Keep the Senate's phone rules.",
    court: "194",
    header: "An Act relative to student learning",
    isBillMatch: false,
    isUserMatch: true,
    subheader: "Alice",
    testimonyId: "t1",
    timestamp: Timestamp.fromDate(new Date("2025-03-01")),
    type: "testimony",
    userRole: "user"
  }

  it("leads conference testimony to its conference with the stance in words", () => {
    render(
      <NewsfeedCard
        {...testimony}
        conferenceId="student-learning-and-mental-health"
        position="passSenateVersion"
      />
    )

    expect(screen.getByText("newsfeed.conferenceInput")).toBeInTheDocument()
    expect(
      screen.getByText("input.position.passSenateVersion.long")
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "S.2581" })).toHaveAttribute(
      "href",
      "/conferences/194/student-learning-and-mental-health"
    )
    expect(
      screen.getByRole("link", { name: "newsfeed.viewConferenceInput" })
    ).toHaveAttribute(
      "href",
      "/conferences/194/student-learning-and-mental-health#input"
    )
    expect(document.querySelector("img[src^='/thumbs-']")).toBeNull()
    expect(document.querySelector("a[href^='/bills/']")).toBeNull()
    expect(document.querySelector("a[href^='/testimony/']")).toBeNull()
  })

  it("says a reader follows the conference, by name, when that is the match", () => {
    render(
      <NewsfeedCard
        {...testimony}
        isUserMatch={false}
        isConferenceMatch={true}
        conferenceId="phones"
        conferenceName="Phone-Free Schools"
        position="passSomething"
      />
    )

    const reason = screen.getByText("newsfeed.follow").closest(".card-title")!
    expect(reason).toHaveTextContent("newsfeed.followPhone-Free Schools")
    expect(reason).not.toHaveTextContent("Alice")
  })

  it("names the conference and the author when the reader follows both", () => {
    render(
      <NewsfeedCard
        {...testimony}
        isConferenceMatch={true}
        conferenceId="phones"
        conferenceName={null}
        position="passSomething"
      />
    )

    // With no name stored, the conference goes by its bill's title.
    const titles = Array.from(document.querySelectorAll(".card-title"))
    expect(titles.map(t => t.textContent)).toContain(
      "newsfeed.followAn Act relative to student learningnewsfeed.andAlice"
    )
  })

  describe("a cosign", () => {
    const cosignOf = {
      id: "lead",
      authorUid: "author2",
      authorName: "Grace",
      content: "Pass a strong final bill this session."
    }
    const quoted = () => document.querySelector("blockquote")

    it("is tagged, with its own line first and the cosigned input under it", () => {
      render(
        <NewsfeedCard
          {...testimony}
          bodyText="As a parent, this matters to me."
          conferenceId="phones"
          cosignOf={cosignOf}
          position="passSomething"
        />
      )

      expect(screen.getByText("newsfeed.cosigned")).toBeInTheDocument()
      const line = screen.getByText('"As a parent, this matters to me."')
      const credit = screen.getByText("newsfeed.cosignedInput")
      expect(
        line.compareDocumentPosition(credit) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
      expect(quoted()).toHaveTextContent(cosignOf.content)
    })

    it("shows the cosigned input without an empty quote when it has no line", () => {
      render(
        <NewsfeedCard
          {...testimony}
          bodyText=""
          conferenceId="phones"
          cosignOf={cosignOf}
          position="passSomething"
        />
      )

      expect(screen.getByText("newsfeed.cosigned")).toBeInTheDocument()
      expect(screen.queryByText('""')).toBeNull()
      expect(screen.getByText("newsfeed.cosignedInput")).toBeInTheDocument()
      expect(quoted()).toHaveTextContent(cosignOf.content)
    })

    it("isn't tagged on input that cosigns nothing", () => {
      render(
        <NewsfeedCard
          {...testimony}
          conferenceId="phones"
          position="passSomething"
        />
      )

      expect(screen.queryByText("newsfeed.cosigned")).toBeNull()
      expect(quoted()).toBeNull()
    })
  })

  it("keeps bill testimony on its bill, testimony page and thumbs", () => {
    render(<NewsfeedCard {...testimony} position="endorse" />)

    expect(screen.getByText("newsfeed.endorsed")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "S.2581" })).toHaveAttribute(
      "href",
      "/bills/194/S2581"
    )
    expect(
      screen.getByRole("link", { name: "newsfeed.viewFullTestimony" })
    ).toHaveAttribute("href", "/testimony/t1")
    expect(
      document.querySelector("img[src='/thumbs-endorse.svg']")
    ).not.toBeNull()
  })
})
