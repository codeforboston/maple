import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { MessageBanner } from "./MessageBanner"

describe("MessageBanner", () => {
  it("renders the heading and content", () => {
    render(<MessageBanner heading="Welcome" content="Get started here" />)
    expect(screen.getByText("Welcome")).toBeInTheDocument()
    expect(screen.getByText("Get started here")).toBeInTheDocument()
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
