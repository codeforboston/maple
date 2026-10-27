/** @jest-environment jsdom */
import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { ConferenceBanner } from "components/conference/ConferenceBanner"
import { HearingConferenceLink } from "components/conference/HearingConferenceLink"
import { ConferenceSummary } from "components/conference/types"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  // Render the key and the interpolated name, enough to see both are used.
  Trans: ({ i18nKey, values, components }: any) => (
    <span>
      {i18nKey}:{" "}
      {components[1] && <a href={components[1].props.href}>{values.name}</a>}
    </span>
  )
}))

const conference: ConferenceSummary = {
  id: "h4000-s2500",
  court: 194,
  name: null,
  title: "An Act relative to testing",
  senateBillId: "S2500",
  houseBillId: "H4000",
  canonicalBillId: "S2500",
  status: "appointed"
}

describe("conference links", () => {
  it.each(["appointed", "reportFiled", "enacted", "dissolved"] as const)(
    "renders the banner for a %s conference, worded by status and linked to it",
    status => {
      render(<ConferenceBanner conference={{ ...conference, status }} />)
      expect(
        screen.getByText(`bill_banner.${status}:`, { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        expect.stringContaining("/conferences/194/h4000-s2500")
      )
    }
  )

  it("renders the hearing link from the prop", () => {
    render(<HearingConferenceLink conference={conference} />)
    expect(screen.getByRole("link")).toBeTruthy()
  })

  it("renders nothing without a conference", () => {
    const { container: a } = render(<ConferenceBanner conference={null} />)
    const { container: b } = render(<HearingConferenceLink conference={null} />)
    expect(a).toBeEmptyDOMElement()
    expect(b).toBeEmptyDOMElement()
  })
})
