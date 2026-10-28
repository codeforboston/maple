import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { MessageBanner } from "./MessageBanner"

describe("MessageBanner", () => {
  it("renders the heading and content", () => {
    render(<MessageBanner heading="Welcome" content="Get started here" />)
    // One copy per skin (Maple's banner and the slim note), with CSS showing
    // one, so find every copy rather than expecting exactly one.
    expect(screen.getAllByText("Welcome")[0]).toBeInTheDocument()
    expect(
      screen.getAllByText("Get started here", { exact: false })[0]
    ).toBeInTheDocument()
  })

  it("renders the icon image when provided", () => {
    render(<MessageBanner heading="Welcome" icon="/icon.png" />)
    expect(screen.getByRole("img")).toHaveAttribute("src", "/icon.png")
  })

  it("renders without an icon when none is provided", () => {
    render(<MessageBanner heading="Welcome" />)
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })
})
