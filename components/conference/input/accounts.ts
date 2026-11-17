import { Role } from "functions/src/auth/types"

/** The name an entry is shown under. */
export { nameOf } from "functions/src/shared"

export type AccountType = "individual" | "organization" | "government"

export const accountTypes: AccountType[] = [
  "individual",
  "organization",
  "government"
]

export const accountTypeOf = (role: Role): AccountType =>
  role === "organization"
    ? "organization"
    : role === "legislator"
    ? "government"
    : "individual"

/** Two letters for the disc, where the account has no picture of its own. */
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("")
