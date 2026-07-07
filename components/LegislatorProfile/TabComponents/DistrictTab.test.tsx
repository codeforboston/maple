import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { DistrictTab } from "./DistrictTab"
import type { District } from "components/db"

const baseDistrict: District = {
  id: "house-9-hampden",
  branch: "House",
  district: "9th Hampden",
  sourceDistrict: "Ninth Hampden",
  sourceUrl: "https://example.test/districts",
  fetchedAt: {} as any,
  municipalities: []
}

describe("DistrictTab", () => {
  it("renders full-town-only districts without subdivision chips", () => {
    render(
      <DistrictTab
        district={{
          ...baseDistrict,
          municipalities: [
            { name: "West Springfield", subdivisions: [] },
            { name: "Springfield", subdivisions: [] }
          ]
        }}
      />
    )

    expect(screen.getAllByText("9th Hampden District")).toHaveLength(2)
    expect(
      screen.getByText("West Springfield & Springfield")
    ).toBeInTheDocument()
    expect(screen.queryByText(/Ward/)).not.toBeInTheDocument()
    expect(
      screen.getByText("Source: MA Secretary of the Commonwealth district data")
    ).toBeInTheDocument()
  })

  it("renders subdivision chips and prefixes them when multiple municipalities are split", () => {
    render(
      <DistrictTab
        district={{
          ...baseDistrict,
          municipalities: [
            {
              name: "West Springfield",
              subdivisions: ["Ward 1 Precinct C1"]
            },
            {
              name: "Springfield",
              subdivisions: ["Ward 8 Precinct A", "Ward 8 Precinct B"]
            }
          ]
        }}
      />
    )

    expect(
      screen.getByText("West Springfield: Ward 1 Precinct C1")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Springfield: Ward 8 Precinct A")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Springfield: Ward 8 Precinct B")
    ).toBeInTheDocument()
  })

  it("renders a fallback when district data is missing", () => {
    render(<DistrictTab />)

    expect(
      screen.getByText("District details are not available yet.")
    ).toBeInTheDocument()
  })
})
