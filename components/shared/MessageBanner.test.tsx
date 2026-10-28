import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { MessageBanner } from "./MessageBanner"

describe("MessageBanner", () => {
  it("renders the heading and content", () => {
    render(<MessageBanner heading="Welcome" content="Get started here" />)
    expect(screen.getByText("Welcome")).toHaveClass("heading")
    expect(screen.getByText("Get started here")).toBeInTheDocument()
  })

  it("renders the icon as a decorative mask when provided", () => {
    const { container } = render(
      <MessageBanner heading="Welcome" icon="/icon.png" />
    )
    const icon = container.querySelector<HTMLElement>(".icon")
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute("aria-hidden", "true")
    expect(icon?.style.getPropertyValue("--icon")).toBe('url("/icon.png")')
    // Drawn with CSS rather than as an image, so there is no img to announce.
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("renders without an icon when none is provided", () => {
    const { container } = render(<MessageBanner heading="Welcome" />)
    expect(container.querySelector(".icon")).toBeNull()
  })
})
