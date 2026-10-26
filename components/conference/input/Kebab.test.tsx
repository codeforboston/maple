import "@testing-library/jest-dom"
import { fireEvent, render, screen } from "@testing-library/react"
import type { ConferenceTestimony } from "components/db"
import { InputContext } from "./context"
import { Kebab } from "./Kebab"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

// The menu's other actions reach for the store and the report API.
jest.mock("components/api/report", () => ({
  useReportTestimony: () => ({ isError: false, isSuccess: false })
}))
jest.mock("components/TestimonyCard/ReportModal", () => ({}))
jest.mock("components/TestimonyCard/ReportToast", () => () => null)
jest.mock("components/hooks", () => ({ useAppDispatch: () => jest.fn() }))
jest.mock("./useToggleFollow", () => ({
  useToggleFollow: () => ({ following: false, toggle: jest.fn() })
}))

const mine = {
  id: "t1",
  authorUid: "me",
  fullName: "Me"
} as unknown as ConferenceTestimony

const mount = (onEdit?: () => void) =>
  render(
    <InputContext.Provider
      value={{
        uid: "me",
        subject: "Data Privacy",
        followed: new Set(),
        onEdit,
        signedIn: true
      }}
    >
      <Kebab testimony={mine} />
    </InputContext.Provider>
  )

// Popper places the menu after it opens, so wait for it.
const menu = async (onEdit?: () => void) => {
  mount(onEdit)
  fireEvent.click(screen.getByRole("button"))
  await screen.findByRole("menu")
}

describe("Kebab", () => {
  it("offers the author an edit while the conference takes input", async () => {
    await menu(jest.fn())
    expect(
      screen.getByRole("menuitem", { name: "input.edit" })
    ).toBeInTheDocument()
  })

  it("offers no edit once the conference stops taking it, but keeps reporting", async () => {
    await menu()
    expect(
      screen.queryByRole("menuitem", { name: "input.edit" })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("menuitem", { name: "input.report" })
    ).toBeInTheDocument()
  })

  it("is worked from the keyboard: arrows move through it, Escape hands focus back", async () => {
    mount(jest.fn())
    const toggle = screen.getByRole("button")
    toggle.focus()
    fireEvent.keyDown(toggle, { key: "ArrowDown" })
    const [edit, report] = await screen.findAllByRole("menuitem")
    expect(edit).toHaveFocus()
    fireEvent.keyDown(edit, { key: "ArrowDown" })
    expect(report).toHaveFocus()
    fireEvent.keyDown(report, { key: "Escape" })
    expect(toggle).toHaveFocus()
    expect(toggle).toHaveAttribute("aria-expanded", "false")
  })
})
