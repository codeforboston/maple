import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { ConferenceHero } from "./ConferenceHero"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts?.returnObjects
        ? // The hero's five steps.
          Array.from({ length: 5 }, (_, i) => ({
            h: `${key}.${i}.h`,
            p: `${key}.${i}.p`
          }))
        : key
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>
}))

// Not a phone: every step's text shows, nothing folds. And wide enough for
// a conference's rail, so the button goes straight to the conference.
jest.mock("./hooks", () => ({
  useMatches: () => false,
  useRailHidden: () => false
}))

describe("ConferenceHero", () => {
  it("is the page's one h1, over the five steps", () => {
    render(<ConferenceHero see="/conferences/194/data-privacy" />)
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    for (let i = 0; i < 5; i++)
      expect(
        screen.getByRole("heading", { name: `hero.steps.${i}.h` })
      ).toBeInTheDocument()
  })

  it("links on to the conference it is given, and to the explorer", () => {
    render(<ConferenceHero see="/conferences/194/data-privacy" />)
    expect(screen.getByRole("link", { name: /hero.see/ })).toHaveAttribute(
      "href",
      "/conferences/194/data-privacy"
    )
    expect(screen.getByRole("link", { name: "explorer" })).toHaveAttribute(
      "href",
      "/conferences/explorer"
    )
  })

  it("disables its button, saying why, where no conference came back", () => {
    render(<ConferenceHero see={null} />)
    const button = screen.getByRole("button", { name: /hero.see/ })
    expect(button).toHaveAttribute("aria-disabled", "true")
    expect(button).toHaveAttribute("title", "hero.see_unavailable")
    expect(
      screen.queryByRole("link", { name: /hero.see/ })
    ).not.toBeInTheDocument()
  })
})
