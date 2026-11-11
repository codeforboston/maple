import { splitMemberName } from "functions/src/shared"

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

/**
 * First initial and surname, which is how the legislature refers to its
 * members: "Bradley H. Jones, Jr." is "B. Jones, Jr.".
 */
export const shortName = (name: string) => {
  const { first, surname, suffix } = splitMemberName(name)
  if (!first) return name
  return `${first[0]}. ${surname}${suffix && `, ${suffix}`}`
}
