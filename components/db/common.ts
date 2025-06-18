import { doc, getDoc, Query, query, QueryConstraint } from "firebase/firestore"
import { DateTime } from "luxon"
import { firestore } from "../firebase"

export async function loadDoc(path: string) {
  const d = await getDoc(doc(firestore, path))
  return d.data()
}

/** Version of `query` that filters out falsy values in query constraints */
export function nullableQuery<T>(
  base: Query<T>,
  ...constraints: (QueryConstraint | undefined | null | "" | false)[]
) {
  const filteredConstraints = constraints.filter(Boolean) as QueryConstraint[]
  return query(base, ...filteredConstraints)
}

/** Mockable function for the current time. */
export function now() {
  return DateTime.now()
}

export function midnight() {
  return now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toJSDate()
}
