import {
  ActivityFiling,
  filterActivity,
  groupActivity,
  isPlaceholderClient,
  normalizePosition,
  orgPositionBreakdown,
  periodOf,
  sessionPeriods,
  sessionPeriodsWith
} from "./activity"
import type { RegistrantInfo } from "components/db/lobbying"

function filing(over: Partial<ActivityFiling>): ActivityFiling {
  return {
    registrantId: "r1",
    entityName: "Acme Lobbying",
    entityNameNorm: "acme lobbying",
    clientName: "Widget Co",
    clientNameNorm: "widget co",
    year: 2025,
    generalCourt: 194,
    billId: "H100",
    activityTitle: "An Act relative to widgets",
    position: "Support",
    disclosureUrl: "https://sos.example/d1",
    periodEnd: "2025-06-30",
    ...over
  }
}

function registrant(over: Partial<RegistrantInfo> = {}): RegistrantInfo {
  return {
    periodEnd: null,
    lobbyists: [],
    clientLobbyists: {},
    ...over
  }
}

describe("normalizePosition", () => {
  it.each([
    ["Support", "support"],
    ["support with amendments", "support"],
    ["Oppose", "oppose"],
    ["Against", "oppose"],
    ["Neutral", "neutral"],
    ["Monitor", "neutral"],
    ["  SUPPORT ", "support"],
    ["", "none"],
    [null, "none"],
    ["Does not oppose", "none"]
  ])("maps %p to %p, as the scraper does", (raw, expected) => {
    expect(normalizePosition(raw)).toBe(expected)
  })
})

describe("periodOf", () => {
  it("labels the first half of the year from the filing's period", () => {
    expect(periodOf(filing({ periodEnd: "2026-06-30" }), {})).toEqual({
      key: "2026-06-30",
      label: "Jan–Jun 2026",
      short: "Jan–Jun 26"
    })
  })

  it("labels the second half of the year", () => {
    expect(periodOf(filing({ periodEnd: "2025-12-31" }), {})).toEqual({
      key: "2025-12-31",
      label: "Jul–Dec 2025",
      short: "Jul–Dec 25"
    })
  })

  it("falls back to the registrant's period", () => {
    const f = filing({ periodEnd: undefined, registrantId: "r9" })
    const regs = { r9: registrant({ periodEnd: "2024-12-31" }) }
    expect(periodOf(f, regs).label).toBe("Jul–Dec 2024")
  })

  it("falls back to the year when neither has a period", () => {
    const f = filing({ periodEnd: null, year: 2012 })
    const regs = { r1: registrant() }
    expect(periodOf(f, regs)).toEqual({
      key: "2012",
      label: "2012",
      short: "2012"
    })
  })
})

describe("groupActivity", () => {
  it("shows a row's most recent period's positions, with each filer's history", () => {
    const filings = [
      filing({ position: "Oppose", periodEnd: "2025-06-30" }),
      filing({ position: "Oppose", periodEnd: "2025-12-31" }),
      filing({
        position: "Neutral",
        periodEnd: "2026-06-30",
        disclosureUrl: "https://sos.example/d3"
      })
    ]
    const { periods, rows } = groupActivity(filings, "client", {}, {})
    expect(periods.map(p => p.label)).toEqual([
      "Jan–Jun 2026",
      "Jul–Dec 2025",
      "Jan–Jun 2025"
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0].filings).toBe(3)
    expect(rows[0].latest).toEqual({
      period: { key: "2026-06-30", label: "Jan–Jun 2026", short: "Jan–Jun 26" },
      positions: ["neutral"]
    })
    expect(rows[0].filers[0].byPeriod).toEqual({
      "2025-06-30": {
        positions: ["oppose"],
        disclosureUrls: ["https://sos.example/d1"]
      },
      "2025-12-31": {
        positions: ["oppose"],
        disclosureUrls: ["https://sos.example/d1"]
      },
      "2026-06-30": {
        positions: ["neutral"],
        disclosureUrls: ["https://sos.example/d3"]
      }
    })
  })

  it("collects every position filers reported in the latest period", () => {
    const filings = [
      filing({ entityNameNorm: "a", entityName: "A", position: "Support" }),
      filing({ entityNameNorm: "b", entityName: "B", position: "Neutral" }),
      filing({ entityNameNorm: "b", entityName: "B", position: "" })
    ]
    const { rows } = groupActivity(filings, "client", {}, {})
    expect(rows[0].latest.positions).toEqual(["support", "neutral"])
    expect(rows[0].filers[1].byPeriod["2025-06-30"].positions).toEqual([
      "neutral"
    ])
  })

  it("puts a filer with no period data under its year", () => {
    const filings = [
      filing({ periodEnd: null, year: 2012, registrantId: "old" })
    ]
    const { periods, rows } = groupActivity(
      filings,
      "client",
      { old: registrant() },
      {}
    )
    expect(periods).toEqual([{ key: "2012", label: "2012", short: "2012" }])
    expect(rows[0].latest.period.label).toBe("2012")
    expect(Object.keys(rows[0].filers[0].byPeriod)).toEqual(["2012"])
  })

  it("decides in-house per client: in-house for one, a firm for another", () => {
    const filings = [
      filing({
        entityName: "Jane Doe",
        entityNameNorm: "jane doe",
        clientName: "Widget Co",
        clientNameNorm: "widget co",
        registrantId: "r1"
      }),
      filing({
        entityName: "Jane Doe",
        entityNameNorm: "jane doe",
        clientName: "Gadget Inc",
        clientNameNorm: "gadget inc",
        registrantId: "r1"
      })
    ]
    const regs = {
      r1: registrant({
        lobbyists: ["Jane Doe", "John Roe"],
        clientLobbyists: { "gadget inc": ["John Roe"] }
      })
    }
    const inHouse = { "widget co": ["jane doe"] }
    const { rows } = groupActivity(filings, "client", regs, inHouse)
    const [gadget, widget] = rows
    expect(widget.filers[0]).toMatchObject({ inHouse: true, agents: [] })
    expect(widget.who).toEqual({ inHouse: ["Jane Doe"], firms: [] })
    expect(gadget.filers[0]).toMatchObject({
      inHouse: false,
      agents: ["John Roe"]
    })
    expect(gadget.who).toEqual({
      inHouse: [],
      firms: [{ name: "Jane Doe", agents: 1 }]
    })
  })

  it("falls back to the firm's lobbyists when it names none for the client", () => {
    const regs = { r1: registrant({ lobbyists: ["A", "B"] }) }
    const { rows } = groupActivity([filing({})], "client", regs, {})
    expect(rows[0].filers[0].agents).toEqual(["A", "B"])
  })

  it("groups by bill, leaving out filings with no bill", () => {
    const filings = [
      filing({ billId: "H100" }),
      filing({ billId: "S20", activityTitle: "An Act about S20" }),
      filing({ billId: null })
    ]
    const { rows } = groupActivity(filings, "bill", {}, {})
    expect(rows.map(r => [r.label, r.title])).toEqual([
      ["H100", "An Act relative to widgets"],
      ["S20", "An Act about S20"]
    ])
  })

  it("keeps a bill number reused in two sessions apart, newest first", () => {
    const filings = [
      filing({ billId: "H1", generalCourt: 193, year: 2023 }),
      filing({ billId: "H1", generalCourt: 194 })
    ]
    const { rows } = groupActivity(filings, "bill", {}, {})
    expect(rows.map(r => [r.key, r.label, r.court])).toEqual([
      ["194/H1", "H1", 194],
      ["193/H1", "H1", 193]
    ])
  })

  it("lists in-house filers before firms", () => {
    const filings = [
      filing({ entityName: "A Firm", entityNameNorm: "a firm" }),
      filing({ entityName: "Z Staff", entityNameNorm: "z staff" })
    ]
    const { rows } = groupActivity(
      filings,
      "client",
      {},
      {
        "widget co": ["z staff"]
      }
    )
    expect(rows[0].filers.map(f => f.entityName)).toEqual(["Z Staff", "A Firm"])
  })
})

describe("orgPositionBreakdown", () => {
  it("counts each organization once, by its most recent period", () => {
    const filings = [
      // Opposed earlier, neutral now: counts as neutral.
      filing({ clientNameNorm: "a", clientName: "A", position: "Oppose" }),
      filing({
        clientNameNorm: "a",
        clientName: "A",
        position: "Neutral",
        periodEnd: "2025-12-31"
      }),
      // Two positions in the same period: multiple.
      filing({ clientNameNorm: "b", clientName: "B", position: "Support" }),
      filing({
        clientNameNorm: "b",
        clientName: "B",
        entityNameNorm: "other",
        position: "Oppose"
      }),
      filing({ clientNameNorm: "c", clientName: "C", position: "Support" }),
      // No position reported.
      filing({ clientNameNorm: "d", clientName: "D", position: "" })
    ]
    const { rows } = groupActivity(filings, "client", {}, {})
    expect(orgPositionBreakdown(rows)).toEqual({
      support: 1,
      oppose: 0,
      neutral: 1,
      multiple: 1,
      none: 1
    })
  })
})

describe("filterActivity", () => {
  const { rows, periods } = groupActivity(
    [
      filing({ clientName: "Widget Co", clientNameNorm: "widget co" }),
      filing({
        clientName: "Gadget Inc",
        clientNameNorm: "gadget inc",
        position: "Oppose"
      })
    ],
    "client",
    {},
    {}
  )
  const labels = (position: Parameters<typeof filterActivity>[1], q: string) =>
    filterActivity({ rows, periods }, position, q).rows.map(r => r.label)

  it("keeps rows whose latest positions include the choice", () => {
    expect(labels("oppose", "")).toEqual(["Gadget Inc"])
    expect(labels("all", "")).toEqual(["Gadget Inc", "Widget Co"])
  })

  it("matches the label and, for bills, the title", () => {
    expect(labels("all", "widget")).toEqual(["Widget Co"])
    const bills = groupActivity([filing({})], "bill", {}, {})
    expect(filterActivity(bills, "all", "widgets").rows).toHaveLength(1)
  })
})

describe("sessionPeriods", () => {
  it("lists a session's ended half-years, newest first", () => {
    expect(
      sessionPeriods(194, new Date("2026-10-23")).map(p => p.label)
    ).toEqual(["Jan–Jun 2026", "Jul–Dec 2025", "Jan–Jun 2025"])
  })

  it("lists all four for a past session, keyed like periodOf", () => {
    const periods = sessionPeriods(193, new Date("2026-10-23"))
    expect(periods.map(p => p.key)).toEqual([
      "2024-12-31",
      "2024-06-30",
      "2023-12-31",
      "2023-06-30"
    ])
    expect(periods[3]).toEqual(
      periodOf(filing({ periodEnd: "2023-06-30" }), {})
    )
  })
})

describe("sessionPeriodsWith", () => {
  it("adds the session's year-only periods and leaves other sessions out", () => {
    const known = [
      periodOf(filing({ periodEnd: null, year: 2025 }), {}),
      periodOf(filing({ periodEnd: "2023-06-30" }), {})
    ]
    expect(
      sessionPeriodsWith(194, known, new Date("2026-10-23")).map(p => p.key)
    ).toEqual(["2026-06-30", "2025-12-31", "2025-06-30", "2025"])
  })
})

describe("placeholders", () => {
  it("leaves 'No client' and the legacy total out of organization rows", () => {
    const filings = [
      filing({}),
      filing({ clientName: "No client", clientNameNorm: "NO CLIENT" }),
      filing({ clientName: "_total_salary_", clientNameNorm: "_total_salary_" })
    ]
    expect(
      groupActivity(filings, "client", {}, {}).rows.map(r => r.label)
    ).toEqual(["Widget Co"])
    expect(
      isPlaceholderClient("Total salaries paid", "TOTAL SALARIES PAID")
    ).toBe(true)
  })

  it("leaves H0/S0 out of bill rows but keeps H1", () => {
    const filings = [
      filing({ billId: "H0" }),
      filing({ billId: "S0" }),
      filing({ billId: "H1" })
    ]
    expect(
      groupActivity(filings, "bill", {}, {}).rows.map(r => r.label)
    ).toEqual(["H1"])
  })
})
