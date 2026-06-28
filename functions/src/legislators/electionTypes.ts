import { sha256 } from "js-sha256"
import {
  Array,
  Union,
  Literal,
  String,
  Boolean,
  Number,
  Optional,
  Static,
  Record
} from "runtypes"

export const officeIds = {
  President: 1,
  "U.S. Senate": 6,
  "U.S. House": 5,
  Governor: 3,
  "Lieutenant Governor": 4,
  "Attorney General": 12,
  "Secretary of the Commonwealth": 45,
  Treasurer: 53,
  Auditor: 90,
  "Governor's Council": 529,
  "State Senate": 9,
  "State Representative": 8,
  "Party State Committee Man": 521,
  "Party State Committee Woman": 522,
  "Delegate to the National Convention": 543,
  "Alternate Delegate to the National Convention": 544,
  "District Attorney": 530,
  "Clerk of Courts": 15,
  "Clerk of Superior Court (Civil)": 534,
  "Clerk of Superior Court (Criminal)": 535,
  "Clerk of Supreme Judicial Court": 536,
  "County Charter Commission": 532,
  "Register of Deeds": 384,
  Sheriff: 386,
  "County Treasurer": 389,
  "Probate Judge": 434,
  "Register of Probate": 537,
  "Council of Governments Executive Committee": 531
} as const
export const offices = Object.keys(officeIds) as (keyof typeof officeIds)[]
export type Office = keyof typeof officeIds

export const parties = [
  "General",
  "American",
  "Democratic",
  "Green-rainbow", // Green-rainbow has the case Green-Rainbow in some scenarios
  "Independent Voters",
  "Libertarian",
  "Republican",
  "Working Families",
  "United Independent Party",
  "United Independent",
  "Independent",
  "Green",
  "Workers Party"
] as const
export type Party = (typeof parties)[number]
export const Party = Union(
  Literal(parties[0]),
  ...parties.slice(1).map(Literal)
)

export const stages = ["Primaries", ...parties]
export type StageSelection = (typeof stages)[number]
export const StageSelection = Union(
  Literal(stages[0]),
  ...stages.slice(1).map(Literal)
)

export const ElectionCandidate = Record({
  name: String,
  writeIn: Boolean,
  votes: Number,
  // Note: During a primary election, no candidate is assigned a party
  party: Optional(String)
})

export type ElectionCandidate = Static<typeof ElectionCandidate>

export const ElectionResult = Record({
  candidates: Array(ElectionCandidate),
  otherVotes: Number,
  blankVotes: Number,
  noPreferenceVotes: Number.optional(),
  totalVotes: Number,
  electionDetailsUrl: String // Can also provide votes by town/ward
})

export type ElectionStage = Static<typeof ElectionStage>

export const ElectionStage = Record({
  party: Party,
  special: Boolean
})

export type ElectionResult = Static<typeof ElectionResult>

export const ElectionInfo = Record({
  // Aligned with Candidates[], for use with Firestore array-contains
  // More specific than name; for example, a dual election (such as for president/vice president)
  // has a name "Harris and Walz", but the link is to the page for Kamala Harris
  candidateUrls: Array(String),
  // As far as I can tell, the only place exact date is shown
  // is the search menu and PDFs
  year: Number,
  office: String,
  // Seemingly non-standardized
  districts: String,
  // For general elections, party === "General"
  party: Party,
  special: Boolean,
  // If this is missing, candidateUrls is deliberately []
  result: Optional(ElectionResult)
})

export type ElectionInfo = Static<typeof ElectionInfo>

export function electionId(election: ElectionInfo): string {
  return sha256(
    `${election.office},${election.year},${election.special},${election.party},${election.districts}`
  )
}
