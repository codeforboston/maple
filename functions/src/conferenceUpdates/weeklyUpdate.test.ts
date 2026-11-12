import {
  buildConferenceUpdateEmail,
  conferenceUpdateSubject,
  renderConferenceUpdate,
  renderConferenceUpdateText,
  summarize,
  tally,
  weekWindow
} from "./weeklyUpdate"
import { InputState } from "./types"

const state = (over: Partial<InputState> = {}): InputState => ({
  position: "passSenateVersion",
  group: "individual",
  version: 1,
  ...over
})

describe("weekWindow", () => {
  it("runs from a week before the run to the run", () => {
    // Monday Sept 28, 2026, 8am Eastern
    const { week, start, end } = weekWindow(new Date("2026-09-28T12:00:00Z"))
    expect(week.toISO()).toBe("2026-09-21T00:00:00.000-04:00")
    expect(start.toISO()).toBe("2026-09-21T08:00:00.000-04:00")
    expect(end.toISO()).toBe("2026-09-28T08:00:00.000-04:00")
  })

  it("names the week before through the next Sunday", () => {
    const { week } = weekWindow(new Date("2026-10-04T23:00:00Z"))
    expect(week.toISODate()).toBe("2026-09-21")
  })

  it("keeps Monday midnight across the autumn clock change", () => {
    const { week, start } = weekWindow(new Date("2026-11-02T13:00:00Z"))
    expect(week.toISO()).toBe("2026-10-26T00:00:00.000-04:00")
    expect(start.toISO()).toBe("2026-10-26T08:00:00.000-04:00")
  })
})

describe("tally", () => {
  it("counts input by group and position", () => {
    const counts = tally([
      state(),
      state({ group: "organization", position: "passNothing" })
    ])
    expect(counts).toEqual({
      total: 2,
      byGroup: { individual: 1, organization: 1, government: 0 },
      byPosition: {
        passSomething: 0,
        passSenateVersion: 1,
        passHouseVersion: 0,
        passNothing: 1
      }
    })
  })
})

describe("summarize", () => {
  it("adds new input", () => {
    const c = summarize([
      { after: state() },
      { after: state({ group: "government" }) }
    ])
    expect(c).toMatchObject({ added: 2, edited: 0, withdrawn: 0 })
    expect(c.net.total).toBe(2)
    expect(c.net.byGroup).toEqual({
      individual: 1,
      organization: 0,
      government: 1
    })
  })

  it("moves an edit between positions without changing the total", () => {
    const c = summarize([
      {
        before: state(),
        after: state({ position: "passNothing", version: 2 })
      }
    ])
    expect(c).toMatchObject({ added: 0, edited: 1 })
    expect(c.net.total).toBe(0)
    expect(c.net.byPosition).toMatchObject({
      passSenateVersion: -1,
      passNothing: 1
    })
  })

  it("lowers the counts for a withdrawal", () => {
    const c = summarize([{ before: state({ group: "organization" }) }])
    expect(c).toMatchObject({ withdrawn: 1, edited: 0, added: 0 })
    expect(c.net.total).toBe(-1)
    expect(c.net.byGroup).toMatchObject({ organization: -1 })
  })

  it("is empty for no events", () => {
    expect(summarize([])).toMatchObject({
      added: 0,
      edited: 0,
      withdrawn: 0,
      net: { total: 0 }
    })
  })
})

describe("the update email", () => {
  const conference = {
    court: 194,
    id: "phone-free-schools",
    title: "An Act relative to phones in schools",
    name: "Phone-Free Schools",
    senateBillId: "S2581",
    houseBillId: "H5366"
  }
  const standing = tally([
    state(),
    state(),
    state({ position: "passNothing", group: "organization" })
  ])
  const changes = summarize([
    { after: state() },
    { after: state({ position: "passNothing", group: "organization" }) }
  ])
  const data = buildConferenceUpdateEmail({
    conference,
    conferees: [
      { name: "Sen. Sam Sen", chair: true },
      { name: "Rep. Pat Rep", chair: false }
    ],
    standing,
    changes,
    week: weekWindow(new Date("2026-09-28T12:00:00Z")).week,
    now: new Date("2026-09-28T12:00:00Z")
  })

  it("names the conference and the week in its subject", () => {
    expect(conferenceUpdateSubject(data)).toBe(
      `Public input on Phone-Free Schools: ${data.weekLabel}`
    )
  })

  it("states the week, the bills and the figures", () => {
    expect(data).toMatchObject({
      bills: "S.2581 / H.5366",
      weekLabel: "September 21–27, 2026",
      sentLabel: "Monday, September 28, 2026",
      total: 3,
      totalDelta: "▲ 2"
    })
    expect(data.groups.map(g => [g.label, g.count, g.delta])).toEqual([
      ["Individuals", 2, "▲ 1"],
      ["Organizations", 1, "▲ 1"],
      ["Government offices", 0, "—"]
    ])
    expect(data.changes).toContain("2 inputs added.")
    expect(data.changes).toContain("Counted input went from 1 to 3.")
    expect(data.changes).toContain("Don't pass anything: 0 → 1.")
  })

  it("renders the conferees, figures and a link to the page", () => {
    const html = renderConferenceUpdate(data)
    expect(html).toContain("Sen. Sam Sen (chair), Rep. Pat Rep")
    expect(html).toContain("S.2581 / H.5366 — Phone-Free Schools")
    expect(html).toContain(
      'href="https://mapletestimony.org/conferences/194/phone-free-schools"'
    )
    expect(html).toContain("Pass the Senate version")
    expect(html).toContain("info@mapletestimony.org")
  })

  it("leaves out unsubscribing and the open questions", () => {
    const html = renderConferenceUpdate(data).toLowerCase()
    expect(html).not.toContain("unsubscribe")
    expect(html).not.toContain("open questions")
  })

  it("says the same in its text part, a line per figure", () => {
    const text = renderConferenceUpdateText(data)
    expect(text).toContain("To: Sen. Sam Sen (chair), Rep. Pat Rep\n")
    expect(text).toContain(
      "Total testimonies: 3 (▲ 2 this week)\nIndividuals: 2 (▲ 1)\n"
    )
    expect(text).toContain("- 2 inputs added.\n")
    expect(text).toContain(
      "https://mapletestimony.org/conferences/194/phone-free-schools"
    )
  })

  it("links the page without saying how many it holds", () => {
    expect(renderConferenceUpdate(data)).not.toMatch(/Read all \d+/)
  })
})
