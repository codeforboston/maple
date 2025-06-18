import { FieldValue } from "@google-cloud/firestore"
import { Record, Result, Runtype, Static } from "runtypes"

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
