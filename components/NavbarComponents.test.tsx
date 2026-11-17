import "@testing-library/jest-dom"
import { act, render, screen } from "@testing-library/react"
import { Dropdown } from "./bootstrap"
import { NavbarConferenceItems } from "./NavbarComponents"

jest.mock("usehooks-ts", () => ({ useMediaQuery: () => false }))
jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))
jest.mock("next/router", () => ({
  useRouter: () => ({ pathname: "/bills", asPath: "/bills" })
}))
jest.mock("./auth", () => ({ useAuth: () => ({}) }))
jest.mock("./db", () => ({ useProfile: () => ({}) }))
// Its module pulls in an ESM-only package.
jest.mock("./shared/CommonComponents", () => ({ BetaTag: () => null }))
let mockConferences = [
  { id: "data-privacy", court: 194, title: "An Act", name: "Data Privacy" },
  { id: "hemp", court: 194, title: "An Act relative to hemp" }
]
jest.mock("./conference/hooks", () => ({
  useAppointedConferences: () => mockConferences
}))

/** The items in an open menu, as the navbar shows them, once Popper has
 * placed it. */
const renderMenu = async () => {
  render(
    <Dropdown show>
      <Dropdown.Menu>
        <NavbarConferenceItems />
      </Dropdown.Menu>
    </Dropdown>
  )
  await act(async () => {})
}

const shownLinks = () =>
  screen.getAllByRole("link").map(a => [a.textContent, a.getAttribute("href")])

describe("NavbarConferenceItems", () => {
  it("leads with the explorer, then the conferences taking input", async () => {
    await renderMenu()
    expect(shownLinks()).toEqual([
      ["navigation.conferenceExplorer", "/conferences/explorer"],
      ["Data Privacy", "/conferences/194/data-privacy"],
      ["An Act relative to hemp", "/conferences/194/hemp"]
    ])
    // The explorer set apart from the list, and the list named.
    expect(screen.getByRole("separator")).toBeInTheDocument()
    expect(
      screen.getByText("navigation.conferencesTakingInput")
    ).toBeInTheDocument()
  })

  it("still leads to the explorer where none is taking input", async () => {
    const all = mockConferences
    mockConferences = []
    await renderMenu()
    expect(shownLinks()).toEqual([
      ["navigation.conferenceExplorer", "/conferences/explorer"]
    ])
    expect(screen.queryByRole("separator")).not.toBeInTheDocument()
    expect(
      screen.queryByText("navigation.conferencesTakingInput")
    ).not.toBeInTheDocument()
    mockConferences = all
  })
})
