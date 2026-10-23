import type { TFunction } from "next-i18next"
import type { SessionFilter } from "./SessionSelect"

// Firms name their agents from 2014, so people counts start with the 189th
// session (2015–16), the first whose two years both carry them.
const PEOPLE_COUNTS_FROM_COURT = 189

/** A client's counts for one session (a summary's courts entry or a Clients
 * list row), or all time (the summary itself, or an all-sessions row). */
type ClientCounts = {
  individuals?: number | null
  firmAgents?: number | null
  inHouseLobbyists?: number | null
  hiredFirms?: number | null
}

/** Who lobbied for a client: its own staff and the firms it hired, plus the
 * agents those firms put on its account where they're known (null before
 * the 189th session and for all sessions). Null when the counts predate
 * these fields. */
export type LobbyistMix = {
  total: number
  inHouse: number
  firms: number
  agents: number | null
}

export function lobbyistMix(
  c: ClientCounts | undefined,
  session: SessionFilter
): LobbyistMix | null {
  if (!c || c.inHouseLobbyists == null || c.hiredFirms == null) return null
  // All-time people counts would mix sessions with and without agents.
  if (
    session !== "all" &&
    session >= PEOPLE_COUNTS_FROM_COURT &&
    c.individuals != null &&
    c.firmAgents != null
  ) {
    const inHouse = c.individuals - c.firmAgents
    // A hired firm that names no agents still lobbied, so the total is at
    // least one per firm: a lower bound, since which firms named no agents
    // isn't stored.
    return {
      total: Math.max(c.individuals, inHouse + c.hiredFirms),
      inHouse,
      firms: c.hiredFirms,
      agents: c.firmAgents
    }
  }
  return {
    total: c.inHouseLobbyists + c.hiredFirms,
    inHouse: c.inHouseLobbyists,
    firms: c.hiredFirms,
    agents: null
  }
}

/** "1 in-house · 1 firm (3 agents)", "all in-house", "2 firms (5 agents)". */
export function lobbyistMixText(mix: LobbyistMix | null, t: TFunction) {
  if (!mix || mix.total === 0) return "—"
  const firms = mix.agents
    ? t("clients.firmsWithAgents", {
        firms: t("clients.firms", { count: mix.firms }),
        count: mix.agents
      })
    : t("clients.firms", { count: mix.firms })
  if (!mix.firms) return t("clients.allInHouse")
  if (!mix.inHouse) return firms
  return `${t("clients.inHouse", { count: mix.inHouse })} · ${firms}`
}
