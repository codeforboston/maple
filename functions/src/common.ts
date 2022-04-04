import { FieldValue } from "@google-cloud/firestore"
import axios from "axios"
import { https, logger } from "firebase-functions"
import {
  Null,
  Nullish,
  Optional,
  Record,
  Result,
  Runtype,
  Static,
  String
} from "runtypes"

/** Parse the request and return the result or fail. */
export function checkRequest<A>(type: Runtype<A>, data: any) {
  const validationResult = type.validate(data)
  if (!validationResult.success) {
    throw fail(
      "invalid-argument",
      `${validationResult.code}: ${validationResult.message}`
    )
  }
  return validationResult.value
}

/** Return the authenticated user's id or fail if they are not authenticated. */
export function checkAuth(context: https.CallableContext) {
  const uid = context.auth?.uid
  if (!uid) {
    throw fail(
      "unauthenticated",
      "Caller must be signed in to publish testimony"
    )
  }
  return uid
}

/** Constructs a new HTTPS error */
export function fail(code: https.FunctionsErrorCode, message: string) {
  return new https.HttpsError(code, message)
}

/** Catch handler to log axios errors and return undefined. */
export const logFetchError = (label: string, id?: string) => (e: any) => {
  if (axios.isAxiosError(e)) {
    logger.info(`Error fetching ${label}${id ? ` - ${id}` : ""}: ${e.message}`)
    return undefined
  } else {
    throw e
  }
}

// In particular, reject "/" in ID strings
const simpleId = /^[A-Za-z0-9-_]+$/
/** Validates firestore-compatible ID's */
export const Id = String.withConstraint(s => simpleId.test(s))

export const NullStr = String.Or(Null)
export const Nullable = <T>(t: Runtype<T>) => Null.Or(t)
export const Maybe = <T>(t: Runtype<T>) => Optional(t.Or(Nullish))
export type Maybe<T> = T | null | undefined

/** Allows specifying defaults that are merged into records before validation.
 * This is useful for compatibility with documents created before adding a field
 * to the type. This adds `checkWithDefaults` and `valideWithDefaults` to the
 * record. `checkWithDefaults` returns a shallow copy of the input. */
export function withDefaults<T extends RecordSpec>(
  Base: Record<T, false>,
  defaults: Partial<RecordType<T>>
): RecordWithDefaults<T> {
  const Type = Base as RecordWithDefaults<T>
  Type.checkWithDefaults = (v: any) => Base.check(mix(v, defaults))
  Type.validateWithDefaults = (v: any) => Base.validate(mix(v, defaults))
  return Type
}

function mix(v: any, defaults: {}) {
  if (!!v && typeof v === "object") {
    return { ...defaults, ...v }
  }
  return v
}

type RecordWithDefaults<T extends RecordSpec> = Record<T, false> & {
  checkWithDefaults(v: any): RecordType<T>
  validateWithDefaults(v: any): Result<RecordType<T>>
}

type RecordSpec = {
  [_: string]: Runtype
}

type RecordType<T extends RecordSpec> = Static<Record<T, false>>

/** A Partial that also allows `FieldValue` */
export type DocUpdate<T> = {
  [Prop in keyof T]?: T[Prop] | FieldValue
}
