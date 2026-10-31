type FilingPeriod = {
  year: number
  periodStart?: string | null
  periodEnd?: string | null
}

const monthName = (month: number, locale: string) =>
  new Date(Date.UTC(2000, month - 1, 1)).toLocaleString(locale, {
    month: "short",
    timeZone: "UTC"
  })

/**
 * Label a filing by its reporting period ("Jan–Jun 2025"). A firm files twice
 * a year and often reports the same position on both disclosures, so the year
 * alone makes the two filings look identical. Filings written before periods
 * were recorded fall back to the year. `shortYear` gives a compact label for
 * tight spaces ("Jan–Jun 25").
 */
export function filingPeriodLabel(
  f: FilingPeriod,
  locale = "en-US",
  shortYear = false
): string {
  const [startYear, startMonth] = (f.periodStart ?? "").split("-").map(Number)
  const [endYear, endMonth] = (f.periodEnd ?? "").split("-").map(Number)
  if (!startYear || !startMonth || !endYear || !endMonth) return String(f.year)
  const start = monthName(startMonth, locale)
  const end = monthName(endMonth, locale)
  const yearText = (y: number) => (shortYear ? String(y).slice(2) : String(y))
  return startYear === endYear
    ? `${start}–${end} ${yearText(endYear)}`
    : `${start} ${yearText(startYear)}–${end} ${yearText(endYear)}`
}

/** Sort filings newest year first, then newest reporting period first. */
export function compareFilingPeriodsDesc(a: FilingPeriod, b: FilingPeriod) {
  return (
    b.year - a.year || (b.periodStart ?? "").localeCompare(a.periodStart ?? "")
  )
}
