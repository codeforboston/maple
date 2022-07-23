import { Literal as L, Record, Static, Union } from "runtypes"

export const Role = Union(
  L("user"),
  L("admin"),
  L("legislator"),
  L("organization")
)
export type Role = Static<typeof Role>

/** Custom-claim payload used for authorization. */
export const Claim = Record({
  role: Role
})
export type Claim = Static<typeof Claim>
