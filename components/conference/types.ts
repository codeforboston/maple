import type { Branch } from "../../functions/src/common"
import type {
  ConferenceAddressedBy,
  ConferenceOutcome,
  ConferenceStatus
} from "../../functions/src/conferences/types"
import type { EventSummary } from "../db/events"

/** The chambers in the order every view shows them: Senate first. */
export const CHAMBERS = ["Senate", "House"] as const

/** A conference as the page and the rail show it: the fields the detail
 * page reads, serialisable as props. */
export type ConferenceSummary = {
  id: string
  court: number
  name: string | null
  title: string
  senateBillId: string
  houseBillId: string
  /** The bill testimony on the conference is filed against. */
  canonicalBillId: string
  status: ConferenceStatus
  /** False where we haven't written the conference up yet. */
  covered: boolean
  /** The conference report's bill, once one is filed. */
  reportBillId: string | null
}

/** A conferee with the member document resolved and their seat on the map
 * found, or null where the map has no cell for their district. */
export type ConfereeView = {
  memberCode: string
  branch: Branch
  chair: boolean
  name: string
  party: string
  district: string
  seat: string | null
}

/** The key a conferee answers to on the map, the lists and the table: their
 * seat, or their member code where the map has no cell for them. */
export const personKey = (c: ConfereeView) => c.seat ?? c.memberCode

/** A linked hearing, without its videos. */
export type HearingView = Pick<EventSummary, "id" | "eventId" | "startsAt">

/** One point the chambers disagree on; a chamber's text is null where its
 * bill has nothing on it. Once a report is filed, how the law resolved it. */
export type DifferenceView = {
  heading: string
  senate: string | null
  house: string | null
  notes: Record<string, string[]>
  outcome: ConferenceOutcome | null
  edited: string | null
  addressedBy: ConferenceAddressedBy | null
  resolution: string | null
  law: string | null
  why: string | null
}

/** One point where the two texts match. */
export type SimilarityView = {
  heading: string
  body: string
}

export type ConferencePageProps = {
  conference: ConferenceSummary
  conferences: ConferenceSummary[]
  conferees: ConfereeView[]
  hearings: HearingView[]
  /** What the bill is, in markdown; null where none is written. */
  gist: string | null
  differences: DifferenceView[]
  similarities: SimilarityView[]
  /** Published input on the conference, as the testimony triggers count it. */
  testimonyCount: number
}

/** The index: every conference, active first, with its conferees by
 * conference id. */
export type ConferenceIndexProps = {
  conferences: ConferenceSummary[]
  conferees: Record<string, ConfereeView[]>
}

/** The short name where there is one, else the act title. */
export const conferenceName = (c: Named) => c.name?.trim() || c.title.trim()

type Named = { name?: string | null; title: string }

/** Alphabetical by the name a conference goes by. */
export const byName = (a: Named, b: Named) =>
  conferenceName(a).localeCompare(conferenceName(b))

/** The ordering the rail uses: still sitting first, then finished. */
export const byActivity = (a: ConferenceSummary, b: ConferenceSummary) =>
  Number(b.status === "appointed") - Number(a.status === "appointed") ||
  byName(a, b)

/** The conference the landing's button opens. */
export type ConferenceLanding = Pick<ConferenceSummary, "court" | "id">
