// Massachusetts General Court sessions run two calendar years; the 184th
// began in 2005.
export function courtYears(court: number): string {
  const start = 2 * (court - 184) + 2005
  return `${start}–${String(start + 1).slice(2)}`
}

export function yearToCourt(year: number): number {
  return 184 + Math.floor((year - 2005) / 2)
}
