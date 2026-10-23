import { uniq } from "lodash"
import type { RegistrantInfo } from "components/db/lobbying"
import type { LobbyingFiling } from "functions/src/lobbying/types"
import { matchesSearch } from "./searchMatch"
import { courtStartYear, yearToCourt } from "./sessions"

export type Position = "support" | "oppose" | "neutral" | "none"

/** A position, or "multiple" for an organization that reported several. */
export type PositionCategory = Position | "multiple"

const POSITION_ORDER: Position[] = ["support", "oppose", "neutral", "none"]

/** Compares names and bill numbers with numbers in order (H2 before H10).
 * One collator, since sorting builds a comparison per pair. */
export const naturalCompare = new Intl.Collator("en", { numeric: true }).compare

/** Mirrors _normalize_position in lobbying-scraper/writer.py, so positions
 * shown per filing agree with the precomputed counts. */
export function normalizePosition(raw: string | null | undefined): Position {
  const s = (raw ?? "").toLowerCase().trim()
  if (s.startsWith("support")) return "support"
  if (s.startsWith("oppose") || s.startsWith("against")) return "oppose"
  if (s.startsWith("neutral") || s.startsWith("monitor")) return "neutral"
  return "none"
}

export type ActivityFiling = Pick<
  LobbyingFiling,
  | "registrantId"
  | "entityName"
  | "entityNameNorm"
  | "clientName"
  | "clientNameNorm"
  | "year"
  | "generalCourt"
  | "billId"
  | "activityTitle"
  | "position"
  | "disclosureUrl"
  | "periodEnd"
>

/** A half-year reporting period. Keys sort chronologically as strings: the
 * period's last day ("2025-06-30"), or just the year ("2025") when the filing
 * and its registrant both lack a period, which sorts before that year's
 * dated periods. */
export type Period = {
  key: string
  label: string
  // A compact label for tight spaces: "Jan–Jun 26".
  short: string
}

function halfYear(year: number, half: 1 | 2): Period {
  const months = half === 1 ? "Jan–Jun" : "Jul–Dec"
  return {
    key: `${year}-${half === 1 ? "06-30" : "12-31"}`,
    label: `${months} ${year}`,
    short: `${months} ${String(year).slice(2)}`
  }
}

/** The session (General Court) a period belongs to. */
export function courtOfPeriod(period: Period): number {
  return yearToCourt(Number(period.key.slice(0, 4)))
}

/** A session's report periods that have ended by `today`, newest first:
 * every half-year a filing could cover, whether or not anyone filed. */
export function sessionPeriods(court: number, today: Date): Period[] {
  const start = courtStartYear(court)
  const iso = today.toISOString().slice(0, 10)
  return [start, start + 1]
    .flatMap(year => [halfYear(year, 1), halfYear(year, 2)])
    .filter(p => p.key < iso)
    .reverse()
}

/** A session's report periods by `today`, plus the year-only periods of its
 * filings that have no reporting window (which sessionPeriods can't
 * generate), newest first. */
export function sessionPeriodsWith(
  court: number,
  known: Period[],
  today: Date
): Period[] {
  const byKey = new Map(sessionPeriods(court, today).map(p => [p.key, p]))
  for (const p of known) if (courtOfPeriod(p) === court) byKey.set(p.key, p)
  return [...byKey.values()].sort((a, b) => (a.key < b.key ? 1 : -1))
}

/** The filing's half-year period: from the filing, else its registrant, else
 * the filing's year. */
export function periodOf(
  filing: ActivityFiling,
  registrants: Record<string, RegistrantInfo>
): Period {
  const end =
    filing.periodEnd ?? registrants[filing.registrantId]?.periodEnd ?? null
  const match = end && /^(\d{4})-(\d{2})/.exec(end)
  if (!match) {
    const year = String(filing.year)
    return { key: year, label: year, short: year }
  }
  const [, year, month] = match
  return halfYear(Number(year), Number(month) <= 6 ? 1 : 2)
}

export type FilerPeriod = { positions: Position[]; disclosureUrls: string[] }

export type ActivityFiler = {
  entityName: string
  entityNameNorm: string
  inHouse: boolean
  // A firm's lobbyists on this account; empty for in-house filers.
  agents: string[]
  byPeriod: Record<string, FilerPeriod>
}

export type ActivityRow = {
  // clientNameNorm, or "<generalCourt>/<billId>": a bill number is reused
  // every session.
  key: string
  // Client name, or bill number.
  label: string
  // The bill's session (bill rows only).
  court?: number
  // The bill's title (bill rows only).
  title?: string
  filings: number
  // The row's most recent period and the positions reported in it. "none"
  // appears only when no filer reported a position that period.
  latest: { period: Period; positions: Position[] }
  // In-house filers first, then by name.
  filers: ActivityFiler[]
  who: { inHouse: string[]; firms: { name: string; agents: number }[] }
}

export type Activity = {
  // Every period in the filings, newest first.
  periods: Period[]
  rows: ActivityRow[]
}

function sortPositions(positions: Iterable<Position>): Position[] {
  return [...new Set(positions)].sort(
    (a, b) => POSITION_ORDER.indexOf(a) - POSITION_ORDER.indexOf(b)
  )
}

function reportedPositions(positions: Iterable<Position>): Position[] {
  const sorted = sortPositions(positions)
  const reported = sorted.filter(p => p !== "none")
  return reported.length ? reported : sorted
}

/**
 * One row per organization (by "client") or per bill (by "bill"), with each
 * filer's positions per period. Filings with no bill are left out of bill
 * rows. `inHouseFilers` is the session's inHouseFilers doc: a filer is
 * in-house when it's listed under the filing's client.
 */
export function groupActivity(
  filings: ActivityFiling[],
  by: "client" | "bill",
  registrants: Record<string, RegistrantInfo>,
  inHouseFilers: Record<string, string[]>
): Activity {
  const periods = new Map<string, Period>()
  const groups = new Map<string, ActivityFiling[]>()
  for (const f of filings) {
    if (by === "bill" && !f.billId) continue
    const key =
      by === "client" ? f.clientNameNorm : `${f.generalCourt}/${f.billId}`
    if (!key) continue
    const group = groups.get(key)
    if (group) group.push(f)
    else groups.set(key, [f])
  }

  const rows = [...groups.entries()].map(([key, group]): ActivityRow => {
    const filers = new Map<string, ActivityFiler>()
    let latest: Period | undefined
    for (const f of group) {
      const period = periodOf(f, registrants)
      periods.set(period.key, period)
      if (!latest || period.key > latest.key) latest = period

      let filer = filers.get(f.entityNameNorm)
      if (!filer) {
        filer = {
          entityName: f.entityName,
          entityNameNorm: f.entityNameNorm,
          inHouse: (inHouseFilers[f.clientNameNorm] ?? []).includes(
            f.entityNameNorm
          ),
          agents: [],
          byPeriod: {}
        }
        filers.set(f.entityNameNorm, filer)
      }
      if (!filer.inHouse) {
        const reg = registrants[f.registrantId]
        filer.agents.push(
          ...(reg?.clientLobbyists[f.clientNameNorm] ?? reg?.lobbyists ?? [])
        )
      }
      const slot = (filer.byPeriod[period.key] ??= {
        positions: [],
        disclosureUrls: []
      })
      slot.positions.push(normalizePosition(f.position))
      if (f.disclosureUrl && !slot.disclosureUrls.includes(f.disclosureUrl))
        slot.disclosureUrls.push(f.disclosureUrl)
    }

    const latestPeriod = latest as Period
    const filerList = [...filers.values()]
    for (const filer of filerList) {
      filer.agents = uniq(filer.agents)
      for (const slot of Object.values(filer.byPeriod))
        slot.positions = reportedPositions(slot.positions)
    }
    filerList.sort(
      (a, b) =>
        Number(b.inHouse) - Number(a.inHouse) ||
        a.entityName.localeCompare(b.entityName)
    )

    const first = group[0]
    return {
      key,
      label: by === "client" ? first.clientName : (first.billId as string),
      ...(by === "bill"
        ? { court: first.generalCourt, title: first.activityTitle }
        : {}),
      filings: group.length,
      latest: {
        period: latestPeriod,
        positions: reportedPositions(
          filerList.flatMap(f => f.byPeriod[latestPeriod.key]?.positions ?? [])
        )
      },
      filers: filerList,
      who: {
        inHouse: filerList.filter(f => f.inHouse).map(f => f.entityName),
        firms: filerList
          .filter(f => !f.inHouse)
          .map(f => ({ name: f.entityName, agents: f.agents.length }))
      }
    }
  })

  // Bill rows: newest session first, then by bill number.
  rows.sort(
    (a, b) =>
      (b.court ?? 0) - (a.court ?? 0) || naturalCompare(a.label, b.label)
  )
  return {
    periods: [...periods.values()].sort((a, b) => (a.key < b.key ? 1 : -1)),
    rows
  }
}

export type PositionBreakdown = Record<PositionCategory, number>

/** Each row (organization) counted once, by the positions in its most recent
 * period: more than one is "multiple". */
export function orgPositionBreakdown(rows: ActivityRow[]): PositionBreakdown {
  const counts = { support: 0, oppose: 0, neutral: 0, multiple: 0, none: 0 }
  for (const row of rows) {
    // "none" is only ever the sole position (see reportedPositions).
    const { positions } = row.latest
    if (positions.length > 1) counts.multiple++
    else counts[positions[0] ?? "none"]++
  }
  return counts
}

/** A position filter's choice: one reported position, or any. */
export type PositionFilter = "all" | Exclude<Position, "none">

/** The rows whose most recent positions include `position`, and whose label
 * (and title, for bills) match `search`. */
export function filterActivity(
  activity: Activity,
  position: PositionFilter,
  search: string
): Activity {
  return {
    ...activity,
    rows: activity.rows.filter(
      r =>
        (position === "all" || r.latest.positions.includes(position)) &&
        matchesSearch(`${r.label} ${r.title ?? ""}`, search)
    )
  }
}
