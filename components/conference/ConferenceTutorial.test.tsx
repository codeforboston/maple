import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import {
  ConferenceTutorial,
  TUTORIAL_POSTER,
  TUTORIAL_VIDEO
} from "./ConferenceTutorial"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts?.returnObjects
        ? // What the video covers, a line each.
          Array.from({ length: 3 }, (_, i) => `${key}.${i}`)
        : key
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>
}))

describe("ConferenceTutorial", () => {
  it("plays the video from the site itself, with controls and a poster", () => {
    const { container } = render(<ConferenceTutorial />)
    const video = container.querySelector("video")
    expect(video).toHaveAttribute("controls")
    expect(video).toHaveAttribute("poster", TUTORIAL_POSTER)
    expect(video).toHaveAttribute("aria-label", "tutorial.video_label")
    expect(video?.querySelector("source")).toHaveAttribute(
      "src",
      TUTORIAL_VIDEO
    )
  })

  it("says in words what the video covers, under the page's one h1", () => {
    render(<ConferenceTutorial />)
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    expect(
      screen.getByRole("heading", { name: "tutorial.covers" })
    ).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")).toHaveLength(3)
  })

  it("links back to the Conference Committees page", () => {
    render(<ConferenceTutorial />)
    expect(screen.getByRole("link", { name: /back_to_home/ })).toHaveAttribute(
      "href",
      "/conferences"
    )
  })
})
