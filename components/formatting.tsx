const billIdFormat = /^(?<chamber>\D+)(?<number>\d+)$/

/** Formats H123 as H.123 */
export const formatBillId = (id: string) => {
  const match = billIdFormat.exec(id)
  if (!match?.groups) {
    return id
  } else {
    return `${match.groups.chamber}.${match.groups.number}`
  }
}

export const truncateText = (s: string | undefined, maxLength: number) =>
  !!s && s.length > maxLength ? s.substring(0, maxLength) + "..." : s
