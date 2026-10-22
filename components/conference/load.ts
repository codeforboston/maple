import { districtId } from "functions/src/districts/normalize"
import type { Branch } from "../../functions/src/common"
import type { ConferenceSource } from "../../functions/src/conferences/types"
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
  HearingView,
  SourceView
} from "./types"

const summarize = (c: Conference): ConferenceSummary => ({
  id: c.id,
  court: c.court,
  name: c.name ?? null,
  title: c.title,
  senateBillId: c.senateBillId,
  houseBillId: c.houseBillId,
  canonicalBillId: c.canonicalBillId,
  status: c.status
})

/** As props: Next refuses undefined, so what is left out arrives as null. */
const sourceView = (s?: ConferenceSource): SourceView | null =>
  s ? { ...s, publishedAt: s.publishedAt ?? null } : null

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
 * seats on the map, and the hearings. A hearing document that is missing, or
 * has no start to date it by, is left out rather than failing the page.
 */
export async function loadConferencePage(
  court: number,
  id: string
): Promise<ConferencePageProps | null> {
  // The rail needs every conference, and the page's own is among them.
  return pageFor(await listConferences(court), id)
}

/** The page for the first conference in the rail's order, which the landing
 * opens on; null where the court has none. */
export async function loadLandingPage(
  court: number
): Promise<ConferencePageProps | null> {
  return pageFor(await listConferences(court))
}

/** The page for conference `id` among `all`, or for the rail's first where
 * there is no `id`. */
async function pageFor(
  all: Conference[],
  id?: string
): Promise<ConferencePageProps | null> {
  const rail = all.map(summarize).sort(byActivity)
  const summary = rail.find(c => c.id === (id ?? rail[0]?.id))
  const conference = all.find(c => c.id === summary?.id)
  if (!summary || !conference) return null
  const [conferees, hearings] = await Promise.all([
    resolveConferees(conference.court, [conference]),
    Promise.all(conference.hearingIds.map(getEventSummary))
  ])

  return {
    conference: summary,
    conferences: rail,
    conferees: conferees[conference.id],
    hearings: hearings
      .flatMap((h): HearingView[] =>
        h?.startsAt
          ? [{ id: h.id, eventId: h.eventId, startsAt: h.startsAt }]
          : []
      )
      .sort((a, b) => a.startsAt - b.startsAt),
    gist: conference.gist ?? null,
    differences: conference.differences.map(d => ({
      heading: d.heading,
      senate: d.senate ?? null,
      house: d.house ?? null,
      notes: d.notes ?? {},
      source: sourceView(d.source)
    })),
    similarities: conference.similarities.map(d => ({
      heading: d.heading,
      body: d.body,
      source: sourceView(d.source)
    }))
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
