import { Timestamp } from "firebase/firestore"

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

const MISSING_TIMESTAMP = Timestamp.fromMillis(0)
export const formatTimestamp = (t?: Timestamp) => {
  if (!t || t.toMillis() == MISSING_TIMESTAMP.toMillis()) {
    return undefined
  }
  return t.toDate().toLocaleDateString()
}
