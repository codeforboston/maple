import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import TitledSectionCard from "./TitledSectionCard"

describe("TitledSectionCard", () => {
  it("renders the title and children", () => {
    render(
      <TitledSectionCard title="My Section">
        <p>Body content</p>
      </TitledSectionCard>
    )
    expect(screen.getByText("My Section")).toBeInTheDocument()
    expect(screen.getByText("Body content")).toBeInTheDocument()
  })

  it("omits the header when no title is provided", () => {
    render(<TitledSectionCard>Body only</TitledSectionCard>)
    expect(screen.getByText("Body only")).toBeInTheDocument()
  })

  it("renders the footer when provided", () => {
    render(
      <TitledSectionCard title="Section" footer={<button>Save</button>}>
        Body
      </TitledSectionCard>
    )
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
  })
})
