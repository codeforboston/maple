import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SortTh } from "./SortTh"

describe("SortTh", () => {
  function header(current: "a" | "b", onSort = jest.fn()) {
    render(
      <table>
        <thead>
          <tr>
            <SortTh
              label="Name"
              sortKey="a"
              current={current}
              dir="asc"
              onSort={onSort}
            />
          </tr>
        </thead>
      </table>
    )
    return onSort
  }

  it("sorts from the keyboard", async () => {
    const onSort = header("b")
    await userEvent.tab()
    expect(screen.getByRole("button", { name: /Name/ })).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(onSort).toHaveBeenCalledWith("a")
  })

  it("marks the sorted column and shows an arrow on every column", () => {
    header("a")
    expect(screen.getByRole("columnheader")).toHaveAttribute(
      "aria-sort",
      "ascending"
    )
    expect(screen.getByText("↑")).toBeInTheDocument()
  })

  it("shows ↕ on an unsorted column", () => {
    header("b")
    expect(screen.getByRole("columnheader")).not.toHaveAttribute("aria-sort")
    expect(screen.getByText("↕")).toBeInTheDocument()
  })
})
