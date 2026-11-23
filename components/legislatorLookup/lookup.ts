import { districtId } from "functions/src/districts/normalize"
import type {
  MemberSearchIndex,
  MemberSearchIndexItem,
  ProfileMember
} from "../db"
import { AddressCandidate, DistrictNames, findDistricts } from "./massgis"

/** Matches precise enough to place a home in one district. StreetName,
 * Locality and Postal matches stand for a whole street, town or ZIP code,
 * which can span several districts. */
const HOUSE_LEVEL_TYPES = new Set([
  "PointAddress",
  "Subaddress",
  "StreetAddress"
])

/** The geocoder's score for a match on every part of the address. */
const EXACT_SCORE = 100
/** Without an exact match, a top match at or above this score is taken if no
 * other comes close. A ZIP code that disagrees with the street costs about
 * half a point; a different town or a corrected street name costs several. */
export const CONFIDENT_SCORE = 99
/** How far ahead of the next match that top match has to be. */
export const CLEAR_LEAD = 2
/** Below this the geocoder is guessing. */
export const MIN_SCORE = 80
export const MAX_CHOICES = 5

export type CandidateDecision =
  /** One clear match: look it up */
  | { kind: "match"; candidate: AddressCandidate }
  /** Several possible matches, or one that isn't quite what was typed: ask */
  | { kind: "choose"; candidates: AddressCandidate[] }
  /** The address exists in more towns than are worth listing */
  | { kind: "needsTown" }
  /** Only a street, town or ZIP code matched */
  | { kind: "needsHouseNumber" }
  | { kind: "notFound" }

const ABBREVIATIONS: Record<string, string> = {
  STREET: "ST",
  AVENUE: "AVE",
  ROAD: "RD",
  DRIVE: "DR",
  LANE: "LN",
  COURT: "CT",
  PLACE: "PL",
  BOULEVARD: "BLVD",
  TERRACE: "TER",
  PARKWAY: "PKWY",
  SQUARE: "SQ",
  CIRCLE: "CIR",
  HIGHWAY: "HWY",
  NORTH: "N",
  SOUTH: "S",
  EAST: "E",
  WEST: "W"
}

/** Uppercase words with common abbreviations applied, for comparing names. */
const words = (text: string) =>
  text
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(word => ABBREVIATIONS[word] ?? word)

/** The geocoder can return one address twice, placed once on the building
 * ("1 ADAMS STREET") and once along the street ("1 ADAMS ST"). Keep one, at
 * the building if there is one, with the better score. */
function dedupe(candidates: AddressCandidate[]) {
  const byAddress = new Map<string, AddressCandidate>()
  for (const candidate of candidates) {
    const key = words(candidate.address).join(" ")
    const seen = byAddress.get(key)
    if (!seen) {
      byAddress.set(key, candidate)
      continue
    }
    const placed =
      seen.addressType !== "PointAddress" &&
      candidate.addressType === "PointAddress"
        ? candidate
        : seen
    byAddress.set(key, {
      ...placed,
      score: Math.max(seen.score, candidate.score)
    })
  }
  return Array.from(byAddress.values())
}

/** How specifically the typed text names the candidate's place: its ZIP code
 * beats any name, and a longer name ("West Roxbury", "South Boston") beats one
 * inside it ("Roxbury", "Boston"). Zero if the text doesn't name it. The words
 * of the candidate's street are set aside first, so "10 Lexington St,
 * Waltham" names Waltham and not Lexington. */
function placeMatch(candidate: AddressCandidate, typed: string) {
  const street = new Set(words(candidate.address.split(",")[0]))
  const text = ` ${words(typed)
    .filter(word => !street.has(word))
    .join(" ")} `
  const named = (name: string) => {
    const n = words(name).join(" ")
    return n !== "" && text.includes(` ${n} `)
  }
  if (named(candidate.zip)) return Number.MAX_SAFE_INTEGER
  return Math.max(
    0,
    ...[candidate.city, candidate.municipality]
      .filter(named)
      .map(name => words(name).join(" ").length)
  )
}

/**
 * Picks the address the user meant from the geocoder's candidates.
 *
 * The geocoder scores a town that shares its county's name (Worcester,
 * Plymouth, Barnstable, …) as matching every town in that county, and gives
 * Boston addresses their neighborhood as the city. So candidates in the town,
 * neighborhood or ZIP code the user typed are preferred over the rest before
 * scores are compared.
 */
export function decideCandidate(
  candidates: AddressCandidate[],
  typed: string
): CandidateDecision {
  let usable = dedupe(
    candidates.filter(
      c => HOUSE_LEVEL_TYPES.has(c.addressType) && c.score >= MIN_SCORE
    )
  )

  if (usable.length === 0) {
    const vague = candidates.some(c => c.score >= MIN_SCORE)
    return vague ? { kind: "needsHouseNumber" } : { kind: "notFound" }
  }

  const best = Math.max(...usable.map(c => placeMatch(c, typed)))
  const placeNamed = best > 0
  if (placeNamed) usable = usable.filter(c => placeMatch(c, typed) === best)
  usable.sort((a, b) => b.score - a.score)

  const exact = usable.filter(c => c.score >= EXACT_SCORE)
  if (exact.length === 1) return { kind: "match", candidate: exact[0] }

  if (exact.length === 0) {
    const [top, next] = usable
    if (
      top.score >= CONFIDENT_SCORE &&
      (!next || top.score - next.score >= CLEAR_LEAD)
    ) {
      return { kind: "match", candidate: top }
    }
  }

  const choices = exact.length > 1 ? exact : usable
  if (!placeNamed && choices.length > MAX_CHOICES) return { kind: "needsTown" }
  return { kind: "choose", candidates: choices.slice(0, MAX_CHOICES) }
}

export type Seat = {
  /** The district as MassGIS names it, e.g. "8th Suffolk" */
  district: string
  /** The sitting member, or null if MAPLE has no current member for the
   * district (usually a vacancy) */
  member: ProfileMember | null
}

export type LegislatorLookupResult = {
  /** The address as matched, for the user to check */
  address: string
  representative: Seat
  senator: Seat
}

export function seatFor(
  branch: "House" | "Senate",
  district: string,
  members: MemberSearchIndexItem[]
): Seat {
  const id = districtId(branch, district)
  const member = members.find(m => districtId(branch, m.District) === id)
  return {
    district,
    member: member
      ? { id: member.MemberCode, district: member.District, name: member.Name }
      : null
  }
}

/** The matched point lies outside the House or Senate map, which happens
 * only offshore or past the state line. */
export class DistrictsNotFoundError extends Error {
  constructor(public districts: DistrictNames) {
    super("No House or Senate district at that address")
    this.name = "DistrictsNotFoundError"
  }
}

export async function lookUpLegislators(
  candidate: AddressCandidate,
  index: MemberSearchIndex,
  fetchImpl: typeof fetch = fetch
): Promise<LegislatorLookupResult> {
  const districts = await findDistricts(candidate, fetchImpl)
  if (!districts.house || !districts.senate) {
    throw new DistrictsNotFoundError(districts)
  }
  return {
    address: candidate.address,
    representative: seatFor("House", districts.house, index.representatives),
    senator: seatFor("Senate", districts.senate, index.senators)
  }
}
