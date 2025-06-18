import { Timestamp as FirebaseTimestamp } from "firebase/firestore"
import { Null, Nullish, Optional, Runtype, String } from "runtypes"

export const Timestamp = FirebaseTimestamp
export type Timestamp = FirebaseTimestamp

export type Maybe<T> = T | null | undefined

// In particular, reject "/" in ID strings
const simpleId = /^[A-Za-z0-9-_]+$/
/** Validates firestore-compatible ID's */
export const Id = String.withConstraint(s => simpleId.test(s))

export const NullStr = String.Or(Null)
export const Nullable = <T>(t: Runtype<T>) => Null.Or(t)
export const Maybe = <T>(t: Runtype<T>) => Optional(t.Or(Nullish))
