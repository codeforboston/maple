// Massachusetts General Court sessions run two calendar years; the 184th
// began in 2005.
export function courtStartYear(court: number): number {
  return 2 * (court - 184) + 2005
}

export function courtYears(court: number): string {
  const start = courtStartYear(court)
  return `${start}–${String(start + 1).slice(2)}`
}

export function yearToCourt(year: number): number {
  return 184 + Math.floor((year - 2005) / 2)
}

export function ordinalSuffix(n: number): string {
  const v = n % 100
  if (v >= 11 && v <= 13) return "th"
  switch (n % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

/** "194th" */
export function courtOrdinal(court: number): string {
  return `${court}${ordinalSuffix(court)}`
}

/** "194th (2025–26)" */
export function courtShortLabel(court: number): string {
  return `${courtOrdinal(court)} (${courtYears(court)})`
}

/** "194th General Court (2025–26)" */
export function courtName(court: number): string {
  return `${courtOrdinal(court)} General Court (${courtYears(court)})`
}
