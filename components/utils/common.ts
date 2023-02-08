/** Loosey goosey type for truthy values that might be null or undefined. */
export type Optional<T> = T | null | undefined

/** Type guard for non-null values */
export const isNotNull = <T>(i: T | null | undefined): i is T =>
  i !== null && i !== undefined

/** Asserts that the input is not null or undefined, and returns the input. */
export const check = <T>(v: T | null | undefined): T => {
  if (v === null || v === undefined)
    throw Error("Illegal null or undefined value")
  return v
}

export type Present<T> = {
  [P in keyof T]-?: NonNullable<T[P]>
}
