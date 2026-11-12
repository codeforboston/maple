import * as fs from "fs"
import * as handlebars from "handlebars"
import { DateTime } from "luxon"
import * as path from "path"
import { Conference } from "../conferences/types"
import { timeZone } from "../malegislature"
import { ConferenceUpdateEmail } from "../notifications/emailTypes"
import { CONFERENCE_STANCES } from "../shared/conferences"
import { ConferencePosition } from "../testimony/types"
import {
  AuthorGroup,
  authorGroups,
  Changes,
  ConferenceInputEvent,
  Counts,
  InputState
} from "./types"

const EMAIL_TEMPLATE_PATH = "../email/conferenceUpdateEmail.handlebars"

/** The order the mockup lists them in. */
const POSITION_ORDER: ConferencePosition[] = [
  "passSenateVersion",
  "passHouseVersion",
  "passSomething",
  "passNothing"
]
const POSITION_COLORS: Record<ConferencePosition, string> = {
  passSenateVersion: "#1A3185",
  passHouseVersion: "#5B6FB8",
  passSomething: "#1F7A4D",
  passNothing: "#C71E32"
}
const GROUPS: Record<AuthorGroup, string> = {
  individual: "Individuals",
  organization: "Organizations",
  government: "Government offices"
}

/** The Monday-to-Sunday week, Eastern, that ended at the Monday on or before
 * `now`. `end` is exclusive. */
export function weekWindow(now: Date) {
  const end = DateTime.fromJSDate(now, { zone: timeZone }).startOf("week")
  return { start: end.minus({ weeks: 1 }), end }
}

const emptyCounts = (): Counts => ({
  total: 0,
  byGroup: { individual: 0, organization: 0, government: 0 },
  byPosition: {
    passSomething: 0,
    passSenateVersion: 0,
    passHouseVersion: 0,
    passNothing: 0
  }
})

const add = (counts: Counts, state: InputState | undefined, sign: 1 | -1) => {
  if (!state) return
  counts.total += sign
  counts.byGroup[state.group] += sign
  counts.byPosition[state.position] += sign
}

/** The counts for a conference's input. */
export function tally(states: InputState[]): Counts {
  const counts = emptyCounts()
  states.forEach(s => add(counts, s, 1))
  return counts
}

/** What a week's events add up to. Each event is input appearing
 * (`added`), edited, or deleted (`withdrawn`). */
export function summarize(
  events: Pick<ConferenceInputEvent, "before" | "after">[]
): Changes {
  const changes: Changes = {
    added: 0,
    edited: 0,
    withdrawn: 0,
    net: emptyCounts()
  }
  for (const { before, after } of events) {
    add(changes.net, before, -1)
    add(changes.net, after, 1)
    if (!before) changes.added++
    else if (after) changes.edited++
    else changes.withdrawn++
  }
  return changes
}

const delta = (n: number) => (n > 0 ? `▲ ${n}` : n < 0 ? `▼ ${-n}` : "—")
const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`

const billLabel = (id: string) => id.replace(/^([A-Za-z]+)(\d+)$/, "$1.$2")

const formatWeek = (start: DateTime) => {
  const last = start.plus({ days: 6 })
  return start.month === last.month
    ? `${start.toFormat("LLLL d")}–${last.toFormat("d, yyyy")}`
    : `${start.toFormat("LLLL d")} – ${last.toFormat("LLLL d, yyyy")}`
}

/** What the template shows. `before` is the standing at the start of the
 * week, which is the standing now less the week's net change. */
export function buildConferenceUpdateEmail({
  conference,
  conferees,
  standing,
  changes,
  start,
  now
}: {
  conference: Pick<
    Conference,
    "court" | "id" | "title" | "name" | "senateBillId" | "houseBillId"
  >
  conferees: { name: string; chair: boolean }[]
  standing: Counts
  changes: Changes
  start: DateTime
  now: Date
}): ConferenceUpdateEmail {
  const { net } = changes
  const total = standing.total
  const bar = POSITION_ORDER.filter(p => standing.byPosition[p] > 0)

  const lines: string[] = []
  if (changes.added) lines.push(`${plural(changes.added, "input")} added.`)
  if (changes.edited) lines.push(`${plural(changes.edited, "input")} edited.`)
  if (changes.withdrawn)
    lines.push(`${plural(changes.withdrawn, "input")} withdrawn.`)
  if (net.total)
    lines.push(`Counted input went from ${total - net.total} to ${total}.`)
  for (const p of POSITION_ORDER)
    if (net.byPosition[p])
      lines.push(
        `${CONFERENCE_STANCES[p]}: ${
          standing.byPosition[p] - net.byPosition[p]
        } → ${standing.byPosition[p]}.`
      )

  return {
    bills: `${billLabel(conference.senateBillId)} / ${billLabel(
      conference.houseBillId
    )}`,
    title: conference.name ?? conference.title,
    conferenceUrl: `https://mapletestimony.org/conferences/${conference.court}/${conference.id}`,
    weekLabel: formatWeek(start),
    sentLabel: DateTime.fromJSDate(now, { zone: timeZone }).toFormat(
      "cccc, LLLL d, yyyy"
    ),
    conferees,
    total,
    totalDelta: delta(net.total),
    groups: authorGroups.map(g => ({
      label: GROUPS[g],
      count: standing.byGroup[g],
      delta: delta(net.byGroup[g])
    })),
    positions: bar.map(p => ({
      label: CONFERENCE_STANCES[p],
      count: standing.byPosition[p],
      delta: delta(net.byPosition[p]),
      width: Math.max(1, Math.round((standing.byPosition[p] / total) * 100)),
      color: POSITION_COLORS[p]
    })),
    changes: lines
  }
}

export const conferenceUpdateSubject = ({
  title,
  weekLabel
}: Pick<ConferenceUpdateEmail, "title" | "weekLabel">) =>
  `Public input on ${title}: ${weekLabel}`

let template: HandlebarsTemplateDelegate<ConferenceUpdateEmail> | undefined

export const renderConferenceUpdate = (data: ConferenceUpdateEmail) =>
  (template ??= handlebars.compile(
    fs.readFileSync(path.join(__dirname, EMAIL_TEMPLATE_PATH), "utf8")
  ))(data)

/** The same update as plain text, section by section as the template. */
export const renderConferenceUpdateText = (d: ConferenceUpdateEmail) =>
  [
    [
      `To: ${d.conferees
        .map(c => (c.chair ? `${c.name} (chair)` : c.name))
        .join(", ")}`,
      `Re: ${d.bills} — ${d.title} — conference committee`,
      `Week of: ${d.weekLabel} · Sent: ${d.sentLabel}`
    ].join("\n"),
    `Public input on ${d.title}: where it stands, and what changed this week`,
    "One summary a week from MAPLE, in place of individual emails. Everything here is drawn from testimony submitted publicly on MAPLE whose authors chose to share it with the committee.",
    [
      "1 · Where input stands",
      `Total testimonies: ${d.total} (${d.totalDelta} this week)`,
      ...d.groups.map(g => `${g.label}: ${g.count} (${g.delta})`),
      "",
      "Position on the bills",
      ...d.positions.map(p => `${p.label}: ${p.count} (${p.delta})`)
    ].join("\n"),
    ["2 · What changed this week", ...d.changes.map(c => `- ${c}`)].join("\n"),
    [
      "3 · Read the testimony",
      "Every submission is public on MAPLE with the author's stated position. Nothing in this summary is paraphrased from private input.",
      d.conferenceUrl
    ].join("\n"),
    "How this is compiled. Counts and positions are from testimony submitted on MAPLE. Positions are the authors' own, not MAPLE's view.",
    "MAPLE is nonpartisan infrastructure and takes no position on this or any bill. Questions, or a reply to this email: info@mapletestimony.org."
  ].join("\n\n")
