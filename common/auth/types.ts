import { Literal as L, Record, Static, Union } from "runtypes"
import { z } from "zod"

export const Role = Union(
  L("user"),
  L("admin"),
  L("legislator"),
  L("pendingUpgrade"),
  L("organization")
)
export type Role = Static<typeof Role>

export const ZRole = z.enum([
  "user",
  "admin",
  "legislator",
  "pendingUpgrade",
  "organization"
])

/** Custom-claim payload used for authorization. */
export const Claim = Record({
  role: Role
})
export type Claim = Static<typeof Claim>

export const Frequency = Union(L("Weekly"), L("Monthly"), L("None"))
export type Frequency = Static<typeof Frequency>

export const OrgCategory = Union(
  L("Agriculture"),
  L("Animal Rights"),
  L("Automotive"),
  L("Civil Rights"),
  L("Communications"),
  L("Consumer Goods"),
  L("Criminal Justice"),
  L("Prison Reform"),
  L("Education"),
  L("Elder Care"),
  L("Employment/Labor"),
  L("Environment"),
  L("Financial"),
  L("Food"),
  L("Good Government"),
  L("Human Rights"),
  L("Children's Rights"),
  L("Death Penalty"),
  L("Disabeled Rights"),
  L("LGBTQ+ Rights"),
  L("Housing"),
  L("Immigration"),
  L("Insurance"),
  L("Internet & Technology"),
  L("Legal"),
  L("Medical/Health"),
  L("Poverty"),
  L("Privacy"),
  L("Racial Justice"),
  L("Regional"),
  L("Refugee"),
  L("Reproductive Health"),
  L("Pharmaceuticals"),
  L("Small & Local Business"),
  L("Taxes"),
  L("Water"),
  L("Women's Rights"),
  L("Multi-issue"),
  L("Other")
)
export type OrgCategory = Static<typeof OrgCategory>
