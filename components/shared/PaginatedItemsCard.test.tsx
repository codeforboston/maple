import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PaginatedItemsCard } from "./PaginatedItemsCard"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const ItemCard = ({ name }: { name: string }) => <div>{name}</div>

const items = Array.from({ length: 25 }, (_, i) => ({ name: `Item ${i + 1}` }))

describe("PaginatedItemsCard", () => {
  it("shows only the first page of items", () => {
    render(
      <PaginatedItemsCard
        title="Items"
        items={items}
        ItemCard={ItemCard}
        loading={false}
        error={null}
      />
    )
    expect(screen.getByText("Item 1")).toBeInTheDocument()
    expect(screen.getByText("Item 10")).toBeInTheDocument()
    expect(screen.queryByText("Item 11")).not.toBeInTheDocument()
  })

  it("moves to the next page and back", async () => {
    const user = userEvent.setup()
    render(
      <PaginatedItemsCard
        title="Items"
        items={items}
        ItemCard={ItemCard}
        loading={false}
        error={null}
      />
    )
    const buttons = screen.getAllByRole("button")
    await user.click(buttons[2])
    expect(screen.getByText("Item 11")).toBeInTheDocument()
    await user.click(buttons[0])
    expect(screen.getByText("Item 1")).toBeInTheDocument()
  })

  it("shows an error alert instead of items when an error is present", () => {
    render(
      <PaginatedItemsCard
        title="Items"
        items={items}
        ItemCard={ItemCard}
        loading={false}
        error="Something went wrong"
      />
    )
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument()
  })

  it("shows a spinner while loading", () => {
    const { container } = render(
      <PaginatedItemsCard
        title="Items"
        items={items}
        ItemCard={ItemCard}
        loading
        error={null}
      />
    )
    expect(container.querySelector(".spinner-border")).toBeInTheDocument()
  })
})
