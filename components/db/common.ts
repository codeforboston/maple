import { doc, getDoc, Query, query, QueryConstraint } from "firebase/firestore"
import { DateTime } from "luxon"
import { Null, Nullish, Optional, Runtype, String } from "runtypes"
import { firestore } from "../firebase"

type GeneralCourt = {
  Name: string
  Number: number
  FirstYear: number
  SecondYear: number
}

export const generalCourts: Record<number, GeneralCourt | undefined> = {
  193: {
    Name: "193rd (Current)",
    Number: 193,
    FirstYear: 2023,
    SecondYear: 2024
  },
  192: {
    Name: "192nd (2021 - 2022)",
    Number: 192,
    FirstYear: 2021,
    SecondYear: 2022
  }
}

export const supportedGeneralCourts = Object.keys(generalCourts)
  .map(n => Number.parseInt(n))
  .sort()
  .reverse()

export const currentGeneralCourt = supportedGeneralCourts[0]

export const isCurrentCourt = (courtNumber: number) =>
  courtNumber === currentGeneralCourt

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

export function midnight() {
  return now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toJSDate()
}

// In particular, reject "/" in ID strings
const simpleId = /^[A-Za-z0-9-_]+$/
/** Validates firestore-compatible ID's */
export const Id = String.withConstraint(s => simpleId.test(s))

export const NullStr = String.Or(Null)
export const Nullable = <T>(t: Runtype<T>) => Null.Or(t)
export const Maybe = <T>(t: Runtype<T>) => Optional(t.Or(Nullish))
