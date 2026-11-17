import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { ConferenceHero } from "./ConferenceHero"

const steps = Array.from({ length: 5 }, (_, i) => ({
  h: `step ${i + 1}`,
  p: `about step ${i + 1}`
}))

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { returnObjects?: boolean }) =>
      key === "hero.steps" && opts?.returnObjects ? steps : key
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey
}))

describe("ConferenceHero", () => {
  it("is the page's one h1, with the five steps under it", () => {
    render(<ConferenceHero landing={null} />)
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(5)
  })

  it("leads on to the landing conference and the explorer", () => {
    render(<ConferenceHero landing={{ court: 194, id: "data-privacy" }} />)
    expect(screen.getByRole("link", { name: /hero.see/ })).toHaveAttribute(
      "href",
      "/conferences/194/data-privacy"
    )
    expect(screen.getByRole("link", { name: /explorer/ })).toHaveAttribute(
      "href",
      "/conferences/explorer"
    )
  })

  it("leads only to the explorer in a court with no conferences", () => {
    render(<ConferenceHero landing={null} />)
    expect(
      screen.queryByRole("link", { name: /hero.see/ })
    ).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /explorer/ })).toBeInTheDocument()
  })
})
