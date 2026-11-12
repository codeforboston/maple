import { districtId } from "functions/src/districts/normalize"
import { currentGeneralCourt } from "functions/src/shared"
import type { Branch } from "../../functions/src/common"
import {
  Conference,
  getConferenceForBill,
  getConferenceForHearing,
  listConferences
} from "../db/conferences"
import { getEventSummary } from "../db/events"
import {
  getMember,
  getMemberSearchIndex,
  MemberContent,
  MemberSearchIndex
} from "../db/members"
import { cells } from "./map/geometry"
import {
  byActivity,
  ConfereeView,
  ConferenceIndexProps,
  ConferenceLanding,
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
  canonicalBillId: c.canonicalBillId,
  status: c.status,
  // Read without validation: a document synced before these fields existed
  // has neither.
  covered: c.covered !== false,
  reportBillId: c.reportBillId ?? null
})

/** Every conference as the rail lists them: active first, then by name. */
const railOf = (all: Conference[]) => all.map(summarize).sort(byActivity)

/** The member's cell on the map: their district id, or null where the map has
 * no such seat. */
const seatFor = (branch: Branch, district: string) => {
  const id = districtId(branch, district)
  return id in cells[branch] ? id : null
}

type MemberFacts = Pick<MemberContent, "Name" | "Party" | "District">

/** Member documents read one by one, by member code. A document that is
 * missing is absent from the result. */
async function membersByRead(court: number, codes: string[]) {
  const members = new Map<string, MemberContent>()
  await Promise.all(
    codes.map(async code => {
      const m = await getMember(court, code)
      if (m) members.set(code, m)
    })
  )
  return members
}

/** Every member in the search index, by member code. */
const membersFromIndex = (index: MemberSearchIndex) =>
  new Map<string, MemberFacts>(
    [...index.representatives, ...index.senators].map(m => [m.MemberCode, m])
  )

/**
 * Each conference's conferees with their members resolved and their seats
 * found, by conference id. A member that is missing is left out rather than
 * failing the page.
 */
function resolveConferees(
  conferences: Conference[],
  members: Map<string, MemberFacts>
): Record<string, ConfereeView[]> {
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

const confereeCodes = (conferences: Conference[]) => [
  ...new Set(conferences.flatMap(c => c.conferees.map(m => m.memberCode)))
]

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
  return pageFor(court, await listConferences(court), id)
}

/** Where the landing's button goes: the first covered conference in the
 * rail's order, else the rail's first; null where the court has none. */
export async function loadLanding(
  court: number
): Promise<ConferenceLanding | null> {
  const rail = railOf(await listConferences(court))
  const landing = rail.find(c => c.covered) ?? rail[0]
  return landing ? { court: landing.court, id: landing.id } : null
}

/** The landing (loadLanding) and every conference in the rail's order, for
 * the Conference Committees page: its button, and the list the button opens
 * on mobile. No members or hearings. */
export async function loadLandingAndRail(court: number): Promise<{
  landing: ConferenceLanding | null
  conferences: ConferenceSummary[]
}> {
  const conferences = railOf(await listConferences(court))
  const landing = conferences.find(c => c.covered) ?? conferences[0]
  return {
    landing: landing ? { court: landing.court, id: landing.id } : null,
    conferences
  }
}

/** The page for conference `id` among `all`. */
async function pageFor(
  court: number,
  all: Conference[],
  id: string
): Promise<ConferencePageProps | null> {
  const rail = railOf(all)
  const summary = rail.find(c => c.id === id)
  const conference = all.find(c => c.id === summary?.id)
  if (!summary || !conference) return null
  const [members, hearings] = await Promise.all([
    membersByRead(court, confereeCodes([conference])),
    Promise.all(conference.hearingIds.map(getEventSummary))
  ])
  const conferees = resolveConferees([conference], members)

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
      outcome: d.outcome ?? null,
      edited: d.edited ?? null,
      addressedBy: d.addressedBy ?? null,
      resolution: d.resolution ?? null,
      law: d.law ?? null,
      why: d.why ?? null
    })),
    similarities: conference.similarities.map(d => ({
      heading: d.heading,
      body: d.body
    })),
    testimonyCount: conference.testimonyCount ?? 0
  }
}

/**
 * Every conference in the court with its conferees, for the index. The
 * current court's members come from the one member search index document;
 * where that is missing (the scheduler doesn't run in the emulator), or the
 * court is another, they are read one by one.
 */
export async function loadConferenceIndex(
  court: number
): Promise<ConferenceIndexProps> {
  // The index doesn't depend on the conferences, so read both at once.
  const [all, index] = await Promise.all([
    listConferences(court),
    court === currentGeneralCourt ? getMemberSearchIndex() : undefined
  ])
  const members = index
    ? membersFromIndex(index)
    : await membersByRead(court, confereeCodes(all))
  return {
    conferences: railOf(all),
    conferees: resolveConferees(all, members)
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
