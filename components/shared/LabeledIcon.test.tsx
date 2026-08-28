import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { LabeledIcon } from "./LabeledIcon"

describe("LabeledIcon", () => {
  it("renders the image with the provided src", () => {
    render(<LabeledIcon idImage="/avatar.png" mainText="Main" subText="Sub" />)
    expect(screen.getByRole("img")).toHaveAttribute("src", "/avatar.png")
  })

  it("renders the main and sub text", () => {
    render(
      <LabeledIcon
        idImage="/avatar.png"
        mainText="Jane Doe"
        subText="Senator"
      />
    )
    expect(screen.getByText("Jane Doe")).toBeInTheDocument()
    expect(screen.getByText("Senator")).toBeInTheDocument()
  })
})
