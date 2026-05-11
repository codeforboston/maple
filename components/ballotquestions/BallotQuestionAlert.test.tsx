import { render, screen } from "@testing-library/react"
import type { ComponentType } from "react"
import { BallotQuestionAlert } from "./BallotQuestionAlert"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const messages: Record<string, string> = {
        "alert.ariaLabel": "Important ballot question notice"
      }
      return messages[key] ?? key
    }
  })
}))

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({
    children,
    className,
    components
  }: {
    children: string
    className?: string
    components?: { a?: ComponentType<any> }
  }) => {
    const match = children.match(/\[([^\]]+)\]\(([^)]+)\)/)
    const Link = components?.a ?? "a"

    return (
      <div className={className}>
        {match ? (
          <>
            {children.slice(0, match.index)}
            <Link href={match[2]}>{match[1]}</Link>
            {children.slice((match.index ?? 0) + match[0].length)}
          </>
        ) : (
          children
        )}
      </div>
    )
  }
}))

describe("BallotQuestionAlert", () => {
  it("renders nothing when alertFlag is null", () => {
    const { container } = render(
      <BallotQuestionAlert alertFlag={null} alertTip={null} />
    )

    expect(container.childElementCount).toBe(0)
  })

  it("renders sanitized markdown links from alertFlag", () => {
    render(
      <BallotQuestionAlert
        alertFlag="Legal challenge pending. [Read more](https://example.com/legal)."
        alertTip={null}
      />
    )

    const link = screen.getByRole("link", { name: "Read more" })
    expect(link.getAttribute("href")).toBe("https://example.com/legal")
    expect(
      screen.getByLabelText("Important ballot question notice")
    ).toBeTruthy()
  })
})
