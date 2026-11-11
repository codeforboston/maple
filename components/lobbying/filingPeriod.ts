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
 * were recorded fall back to the year.
 */
export function filingPeriodLabel(f: FilingPeriod, locale = "en-US"): string {
  const [startYear, startMonth] = (f.periodStart ?? "").split("-").map(Number)
  const [endYear, endMonth] = (f.periodEnd ?? "").split("-").map(Number)
  if (!startYear || !startMonth || !endYear || !endMonth) return String(f.year)
  const start = monthName(startMonth, locale)
  const end = monthName(endMonth, locale)
  return startYear === endYear
    ? `${start}–${end} ${endYear}`
    : `${start} ${startYear}–${end} ${endYear}`
}

/** Sort filings newest year first, then newest reporting period first. */
export function compareFilingPeriodsDesc(a: FilingPeriod, b: FilingPeriod) {
  return (
    b.year - a.year || (b.periodStart ?? "").localeCompare(a.periodStart ?? "")
  )
}
