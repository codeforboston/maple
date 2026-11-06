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

const mount = (
  onEdit?: () => void,
  cosignLink?: (t: ConferenceTestimony) => string,
  testimony: ConferenceTestimony = mine
) =>
  render(
    <InputContext.Provider
      value={{
        uid: "me",
        subject: "Data Privacy",
        followed: new Set(),
        onEdit,
        signedIn: true,
        cosignLink,
        byId: new Map()
      }}
    >
      <Kebab testimony={testimony} />
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

  describe("Copy cosign link", () => {
    const link = (t: ConferenceTestimony) =>
      `https://maple.test/c?cosign=${t.id}`
    // null for a closed conference, which offers no link.
    const open = async (
      testimony: ConferenceTestimony,
      cosignLink: typeof link | null = link
    ) => {
      mount(undefined, cosignLink ?? undefined, testimony)
      fireEvent.click(screen.getByRole("button"))
      await screen.findByRole("menu")
    }
    const item = () =>
      screen.queryByRole("menuitem", { name: "input.copy_cosign_link" })

    it("copies the link from the author's own card", async () => {
      const writeText = jest.fn(async () => {})
      Object.assign(navigator, { clipboard: { writeText } })
      await open({ ...mine, authorRole: "organization" } as ConferenceTestimony)
      fireEvent.click(item()!)
      expect(writeText).toHaveBeenCalledWith("https://maple.test/c?cosign=t1")
      expect(
        await screen.findByText("input.cosign_link_copied")
      ).toBeInTheDocument()
    })

    it("is not offered on a cosign", async () => {
      await open({ ...mine, cosignOfId: "t0" } as ConferenceTestimony)
      expect(item()).not.toBeInTheDocument()
    })

    it("is not offered on a legislator's input", async () => {
      await open({ ...mine, authorRole: "legislator" } as ConferenceTestimony)
      expect(item()).not.toBeInTheDocument()
    })

    it("is not offered once the conference has closed", async () => {
      await open(
        { ...mine, authorRole: "organization" } as ConferenceTestimony,
        null
      )
      expect(item()).not.toBeInTheDocument()
    })
  })
})
