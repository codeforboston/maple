import { doc, getDoc, Query, query, QueryConstraint } from "firebase/firestore"
import { DateTime } from "luxon"
import { Null, Nullish, Optional, Runtype, String } from "runtypes"
import { firestore } from "../firebase"

export const currentGeneralCourt = 192

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

export type Maybe<T> = T | null | undefined

// In particular, reject "/" in ID strings
const simpleId = /^[A-Za-z0-9-_]+$/
/** Validates firestore-compatible ID's */
export const Id = String.withConstraint(s => simpleId.test(s))

export const NullStr = String.Or(Null)
export const Nullable = <T>(t: Runtype<T>) => Null.Or(t)
export const Maybe = <T>(t: Runtype<T>) => Optional(t.Or(Nullish))
