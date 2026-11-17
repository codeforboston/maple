import { render, screen } from "@testing-library/react"
import { HistoryTable } from "./HistoryTable"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

jest.mock("./Status", () => ({
  CourtContext: require("react").createContext(194)
}))

jest.mock("components/links", () => ({
  billSiteURL: (id: string, court: number) => `/bills/${court}/${id}`,
  Wrap: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  )
}))

const renderAction = (Action: string) => {
  const result = render(
    <HistoryTable
      billHistory={[{ Date: "2025-11-25T00:00:00", Branch: "Joint", Action }]}
    />
  )
  return { ...result, actionCell: screen.getAllByRole("cell")[1] }
}

describe("HistoryTable", () => {
  it("strips hearing markup while preserving the line break and text", () => {
    const { actionCell } = renderAction(
      'Hearing rescheduled to 11/25/2025 from 10:00 AM-04:00 PM in A-2 and Virtual<br> <span style="color: blue; font-style: italic;">Hearing updated to New End Time</span>'
    )

    expect(actionCell.textContent).toBe(
      "Hearing rescheduled to 11/25/2025 from 10:00 AM-04:00 PM in A-2 and Virtual\n Hearing updated to New End Time"
    )
    expect(actionCell.querySelector("span, br")).toBeNull()
    expect(screen.getByText("11-25-2025")).toBeTruthy()
    expect(screen.getByText("Joint")).toBeTruthy()
  })

  it("keeps plain text and links bill references after removing markup", () => {
    const { actionCell } = renderAction(
      'Referred to <span data-note="H9999">H2021</span> and S42'
    )

    expect(actionCell.textContent).toBe("Referred to H2021 and S42")
    expect(
      screen.getByRole("link", { name: "H2021" }).getAttribute("href")
    ).toBe("/bills/194/H2021")
    expect(screen.getByRole("link", { name: "S42" }).getAttribute("href")).toBe(
      "/bills/194/S42"
    )
    expect(screen.queryByRole("link", { name: "H9999" })).toBeNull()
  })

  it("decodes entities once and keeps encoded markup inert", () => {
    const { actionCell } = renderAction(
      "Ways &amp; Means &lt;review&gt; &lt;img src=x onerror=alert(1)&gt;"
    )

    expect(actionCell.textContent).toBe(
      "Ways & Means <review> <img src=x onerror=alert(1)>"
    )
    expect(actionCell.querySelector("img, review")).toBeNull()
  })

  it("drops active content and feed links, leaving only readable text", () => {
    const { actionCell } = renderAction(
      '<script>alert(1)</script><style>body { display: none }</style><img src=x onerror="alert(1)"><a href="javascript:alert(1)">Updated</a><iframe src="https://example.com">hidden</iframe><BR/>Next'
    )

    expect(actionCell.textContent).toBe("Updated\nNext")
    expect(actionCell.childElementCount).toBe(0)
  })

  it.each([
    "",
    "No further action",
    "<span>Updated <em>hearing</span><br>Next"
  ])("handles empty, plain and malformed actions: %s", action => {
    const { actionCell } = renderAction(action)
    expect(actionCell.textContent).toBe(
      action.startsWith("<") ? "Updated hearing\nNext" : action
    )
  })
})
