import type { Branch } from "../../functions/src/common"
import type { ConferenceStatus } from "../../functions/src/conferences/types"
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

export type ConferencePageProps = {
  conference: ConferenceSummary
  conferences: ConferenceSummary[]
  conferees: ConfereeView[]
  hearings: HearingView[]
}

/** The index: every conference, active first, with its conferees by
 * conference id. */
export type ConferenceIndexProps = {
  conferences: ConferenceSummary[]
  conferees: Record<string, ConfereeView[]>
}

/** The short name where there is one, else the act title. */
export const conferenceName = (c: { name?: string | null; title: string }) =>
  c.name?.trim() || c.title.trim()

/** The ordering the rail uses: still sitting first, then finished. */
export const byActivity = (a: ConferenceSummary, b: ConferenceSummary) =>
  Number(b.status === "appointed") - Number(a.status === "appointed") ||
  conferenceName(a).localeCompare(conferenceName(b))
