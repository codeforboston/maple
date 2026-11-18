import "@testing-library/jest-dom"
import { fireEvent, render, screen } from "@testing-library/react"
import { Dispatch, SetStateAction } from "react"
import {
  FOLD_UNCOVERED,
  oneOpen,
  RailGroup,
  RailList,
  SHOW_PAST_CONFERENCES
} from "./ConferenceRail"
import { ConferenceSummary } from "./types"

jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const conference = (
  id: string,
  status: ConferenceSummary["status"] = "appointed",
  more: Partial<ConferenceSummary> = {}
): ConferenceSummary => ({
  id,
  court: 194,
  name: id,
  title: id,
  senateBillId: "S1",
  houseBillId: "H1",
  canonicalBillId: "S1",
  status,
  covered: true,
  reportBillId: null,
  ...more
})

const conferences = [
  conference("sitting"),
  conference("uncovered", "appointed", { covered: false }),
  conference("enacted", "enacted", { reportBillId: "H5350" }),
  conference("dissolved", "dissolved")
]

/** A group's fold, by its heading. */
const fold = (heading: string) => screen.getByText(heading).closest("details")!
const folded = { open: null, onToggle: () => {} }
const link = (name: RegExp) => screen.getByRole("link", { name })

// These run only while past conferences are listed (SHOW_PAST_CONFERENCES).
const describePast = SHOW_PAST_CONFERENCES ? describe : describe.skip

describe("RailList", () => {
  // Which of these two runs depends on FOLD_UNCOVERED.
  ;(FOLD_UNCOVERED ? it : it.skip)(
    "groups the not covered conferences under Not covered",
    () => {
      render(
        <RailList conferences={conferences} current="sitting" fold={folded} />
      )

      expect(fold("not_covered")).not.toHaveAttribute("open")
      expect(fold("not_covered")).toContainElement(link(/^uncovered/))
      expect(fold("not_covered")).not.toContainElement(link(/^sitting/))
    }
  )
  ;(FOLD_UNCOVERED ? it.skip : it)(
    "lists the not covered conferences last, marked Not covered",
    () => {
      render(
        <RailList
          conferences={[
            conference("uncovered", "appointed", { covered: false }),
            conference("sitting")
          ]}
          current="sitting"
          fold={folded}
        />
      )

      const links = screen.getAllByRole("link")
      expect(links.map(a => a.getAttribute("href"))).toEqual([
        expect.stringContaining("sitting"),
        expect.stringContaining("uncovered")
      ])
      expect(links[1]).toHaveTextContent("not_covered")
      expect(links[1].closest("details")).toBeNull()
    }
  )

  it("has no group where no conference is in it", () => {
    const { container } = render(
      <RailList
        conferences={[conference("a"), conference("b")]}
        current="a"
        fold={folded}
      />
    )

    expect(container.querySelector("details")).toBeNull()
  })

  // With past conferences off, none are listed. Not covered ones still are,
  // since they're still sitting.
  ;(SHOW_PAST_CONFERENCES ? it.skip : it)(
    "lists no past conferences, but still the not covered ones",
    () => {
      const { container } = render(
        <RailList conferences={conferences} current="sitting" fold={folded} />
      )

      expect(container.querySelectorAll("details")).toHaveLength(
        FOLD_UNCOVERED ? 1 : 0
      )
      expect(link(/^uncovered/)).toBeInTheDocument()
      expect(container.querySelector('a[href*="enacted"]')).toBeNull()
      expect(container.querySelector('a[href*="dissolved"]')).toBeNull()
    }
  )
})

describePast("RailList's past conferences", () => {
  it("groups each by its status, only the statuses some have", () => {
    render(
      <RailList conferences={conferences} current="sitting" fold={folded} />
    )

    expect(fold("status.enacted")).toContainElement(link(/^enacted/))
    expect(fold("status.dissolved")).toContainElement(link(/^dissolved/))
    expect(screen.queryByText("status.reportFiled")).not.toBeInTheDocument()
  })

  it("shows its new bill number beside its name, not its status", () => {
    render(
      <RailList conferences={conferences} current="sitting" fold={folded} />
    )

    expect(link(/^enacted/)).toHaveTextContent("H.5350")
    expect(link(/^enacted/)).not.toHaveTextContent("status.enacted")
  })

  it("opens the group the page says, marking the current conference", () => {
    render(
      <RailList
        conferences={conferences}
        current="enacted"
        fold={{ open: "enacted", onToggle: () => {} }}
      />
    )

    expect(fold("status.enacted")).toHaveAttribute("open")
    expect(fold("status.dissolved")).not.toHaveAttribute("open")
    expect(link(/^enacted/)).toHaveAttribute("aria-current", "page")
  })

  it("tells the page which group the reader opens", () => {
    const onToggle = jest.fn()
    render(
      <RailList
        conferences={conferences}
        current="sitting"
        fold={{ open: null, onToggle }}
      />
    )

    const dissolved = fold("status.dissolved")
    dissolved.open = true
    fireEvent(dissolved, new Event("toggle"))

    expect(onToggle).toHaveBeenCalledWith("dissolved", true)
  })
})

describe("oneOpen", () => {
  it("keeps one group open at a time", () => {
    let open: RailGroup | null = null
    const set: Dispatch<SetStateAction<RailGroup | null>> = next => {
      open = typeof next === "function" ? next(open) : next
    }
    const toggle = oneOpen(set)

    toggle("enacted", true)
    expect(open).toBe("enacted")
    toggle("uncovered", true)
    expect(open).toBe("uncovered")
    // The browser then reports the old group closing; the new one stays open.
    toggle("enacted", false)
    expect(open).toBe("uncovered")
    toggle("uncovered", false)
    expect(open).toBeNull()
  })
})
