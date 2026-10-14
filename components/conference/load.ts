import {
  Conference,
  getConferenceForBill,
  getConferenceForHearing,
  listConferences
} from "../db/conferences"
import { getEventSummary } from "../db/events"
import { getMember } from "../db/members"
import { seatKey } from "./map/seats"
import {
  byActivity,
  ConfereeView,
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

/**
 * Everything the conference page renders, resolved server-side so the page
 * arrives complete: the conference, the rail, the six members with their
 * seats on the map, and the hearings. A member or hearing document that is
 * missing is left out rather than failing the page.
 */
export async function loadConferencePage(
  court: number,
  id: string
): Promise<ConferencePageProps | null> {
  // The rail needs every conference, and the page's own is among them.
  const all = await listConferences(court)
  const conference = all.find(c => c.id === id)
  if (!conference) return null

  const [members, hearings] = await Promise.all([
    Promise.all(conference.conferees.map(c => getMember(court, c.memberCode))),
    Promise.all(conference.hearingIds.map(getEventSummary))
  ])

  const conferees = conference.conferees.flatMap((c, i): ConfereeView[] => {
    const m = members[i]
    if (!m) return []
    return [
      {
        memberCode: c.memberCode,
        branch: c.branch,
        chair: c.chair === true,
        name: m.Name,
        party: m.Party,
        district: m.District,
        seat: seatKey(c.branch, m.District) ?? null
      }
    ]
  })

  return {
    conference: summarize(conference),
    conferences: all.map(summarize).sort(byActivity),
    conferees,
    hearings: hearings
      .flatMap((h): HearingView[] =>
        h ? [{ id: h.id, eventId: h.eventId, startsAt: h.startsAt }] : []
      )
      .sort((a, b) => a.startsAt - b.startsAt)
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
