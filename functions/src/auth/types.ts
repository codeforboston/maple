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

export const Frequency = Union(L("Weekly"), L("Monthly"), L("Daily"), L("None"))
export type Frequency = Static<typeof Frequency>

export const OrgCategories = [
  "Agriculture",
  "Animal Rights",
  "Automotive",
  "Civil Rights",
  "Communications",
  "Consumer Goods",
  "Criminal Justice",
  "Prison Reform",
  "Education",
  "Elder Care",
  "Employment/Labor",
  "Environment",
  "Financial",
  "Food",
  "Good Government",
  "Human Rights",
  "Children's Rights",
  "Death Penalty",
  "Disabeled Rights",
  "LGBTQ+ Rights",
  "Housing",
  "Immigration",
  "Insurance",
  "Internet & Technology",
  "Legal",
  "Medical/Health",
  "Poverty",
  "Privacy",
  "Racial Justice",
  "Regional",
  "Refugee",
  "Reproductive Health",
  "Pharmaceuticals",
  "Small & Local Business",
  "Taxes",
  "Water",
  "Women's Rights",
  "Multi-issue",
  "Other"
] as const

export type OrgCategory = (typeof OrgCategories)[number]
