import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SortTh } from "./SortTh"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

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
    const th = screen.getByRole("columnheader")
    expect(th).toHaveAttribute("aria-sort", "ascending")
    expect(th.querySelector('svg[data-icon="arrow-up"]')).toBeInTheDocument()
    expect(screen.getByText("sort.lowFirst")).toBeInTheDocument()
  })

  it("shows both carets on an unsorted column", () => {
    header("b")
    const th = screen.getByRole("columnheader")
    expect(th).not.toHaveAttribute("aria-sort")
    expect(th.querySelector('svg[data-icon="sort"]')).toBeInTheDocument()
  })
})
