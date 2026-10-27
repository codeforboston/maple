import { compareFilingPeriodsDesc, filingPeriodLabel } from "./filingPeriod"

describe("filingPeriodLabel", () => {
  it("labels a half-year period within one year", () => {
    expect(
      filingPeriodLabel({
        year: 2025,
        periodStart: "2025-07-01",
        periodEnd: "2025-12-31"
      })
    ).toBe("Jul–Dec 2025")
  })

  it("labels a period spanning two years", () => {
    expect(
      filingPeriodLabel({
        year: 2025,
        periodStart: "2025-12-01",
        periodEnd: "2026-01-31"
      })
    ).toBe("Dec 2025–Jan 2026")
  })

  it("falls back to the year when the period is unknown", () => {
    expect(filingPeriodLabel({ year: 2019 })).toBe("2019")
    expect(
      filingPeriodLabel({ year: 2019, periodStart: null, periodEnd: null })
    ).toBe("2019")
  })
})

describe("compareFilingPeriodsDesc", () => {
  it("puts the later period of the same year first", () => {
    const first = { year: 2025, periodStart: "2025-01-01" }
    const second = { year: 2025, periodStart: "2025-07-01" }
    expect([first, second].sort(compareFilingPeriodsDesc)).toEqual([
      second,
      first
    ])
  })
})
