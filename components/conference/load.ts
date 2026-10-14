import { districtId } from "functions/src/districts/normalize"
import type { Branch } from "../../functions/src/common"
import {
  Conference,
  getConferenceForBill,
  getConferenceForHearing,
  listConferences
} from "../db/conferences"
import { getEventSummary } from "../db/events"
import { getMember } from "../db/members"
import { cells } from "./map/geometry"
import {
  byActivity,
  ConfereeView,
  ConferenceIndexProps,
  ConferencePageProps,
  ConferenceSummary,
  HearingView
} from "./types"

const summarize = (c: Conference): ConferenceSummary => ({
  id: c.id,
  court: c.court,
  name: c.name ?? null,
  title: c.title,
  senateBillId: c.senateBillId,
  houseBillId: c.houseBillId,
  status: c.status
})

/** The member's cell on the map: their district id, or null where the map has
 * no such seat. */
const seatFor = (branch: Branch, district: string) => {
  const id = districtId(branch, district)
  return id in cells[branch] ? id : null
}

/**
 * Each conference's conferees with their member documents resolved and their
 * seats found, by conference id. A member sitting on several conferences is
 * read once. A member document that is missing is left out rather than
 * failing the page.
 */
async function resolveConferees(
  court: number,
  conferences: Conference[]
): Promise<Record<string, ConfereeView[]>> {
  const codes = [
    ...new Set(conferences.flatMap(c => c.conferees.map(m => m.memberCode)))
  ]
  const members = new Map(
    await Promise.all(
      codes.map(async code => [code, await getMember(court, code)] as const)
    )
  )

  return Object.fromEntries(
    conferences.map(conference => [
      conference.id,
      conference.conferees.flatMap((c): ConfereeView[] => {
        const m = members.get(c.memberCode)
        if (!m) return []
        return [
          {
            memberCode: c.memberCode,
            branch: c.branch,
            chair: c.chair === true,
            name: m.Name,
            party: m.Party,
            district: m.District,
            seat: seatFor(c.branch, m.District)
          }
        ]
      })
    ])
  )
}

/**
 * Everything the conference page renders, resolved server-side so the page
 * arrives complete: the conference, the rail, the six members with their
 * seats on the map, and the hearings. A hearing document that is missing is
 * left out rather than failing the page.
 */
export async function loadConferencePage(
  court: number,
  id: string
): Promise<ConferencePageProps | null> {
  // The rail needs every conference, and the page's own is among them.
  const all = await listConferences(court)
  const conference = all.find(c => c.id === id)
  if (!conference) return null

  const [conferees, hearings] = await Promise.all([
    resolveConferees(court, [conference]),
    Promise.all(conference.hearingIds.map(getEventSummary))
  ])

  return {
    conference: summarize(conference),
    conferences: all.map(summarize).sort(byActivity),
    conferees: conferees[conference.id],
    hearings: hearings
      .flatMap((h): HearingView[] =>
        h ? [{ id: h.id, eventId: h.eventId, startsAt: h.startsAt }] : []
      )
      .sort((a, b) => a.startsAt - b.startsAt)
  }
}

/** Every conference in the court with its conferees, for the index. */
export async function loadConferenceIndex(
  court: number
): Promise<ConferenceIndexProps> {
  const all = await listConferences(court)
  return {
    conferences: all.map(summarize).sort(byActivity),
    conferees: await resolveConferees(court, all)
  }
}

/** The conference a bill is in, for the bill page's banner. */
export async function loadConferenceForBill(
  court: number,
  billId: string
): Promise<ConferenceSummary | null> {
  const c = await getConferenceForBill(court, billId)
  return c ? summarize(c) : null
}

/** The conference a hearing belongs to, by the hearing page's numeric id. */
export async function loadConferenceForHearing(
  generalCourtNumber: string | null,
  hearingId: string
): Promise<ConferenceSummary | null> {
  if (!generalCourtNumber) return null
  const c = await getConferenceForHearing(
    Number(generalCourtNumber),
    `hearing-${hearingId}`
  )
  return c ? summarize(c) : null
}
