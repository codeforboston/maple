import type { TFunction } from "next-i18next"
import { lobbyistMix, lobbyistMixText } from "./clientCounts"
import { courtName, courtShortLabel } from "./sessions"

describe("lobbyistMix", () => {
  it("counts people and agents from the 189th session on", () => {
    const c = {
      individuals: 4,
      firmAgents: 3,
      inHouseLobbyists: 1,
      hiredFirms: 1
    }
    expect(lobbyistMix(c, 194)).toEqual({
      total: 4,
      inHouse: 1,
      firms: 1,
      agents: 3
    })
  })

  it("adds hired firms that named no agents to the people count", () => {
    // One firm named 3 agents, another named none: 4 lobbied.
    const c = {
      individuals: 3,
      firmAgents: 3,
      firmsWithoutAgents: 1,
      inHouseLobbyists: 0,
      hiredFirms: 2
    }
    expect(lobbyistMix(c, 194)).toEqual({
      total: 4,
      inHouse: 0,
      firms: 2,
      agents: 3
    })
  })

  it("counts lobbyists and firms before the 189th, with no agents", () => {
    const c = {
      individuals: 2,
      firmAgents: 0,
      inHouseLobbyists: 1,
      hiredFirms: 2
    }
    expect(lobbyistMix(c, 188)).toEqual({
      total: 3,
      inHouse: 1,
      firms: 2,
      agents: null
    })
  })

  it("ignores people counts for all sessions", () => {
    // A summary's all-time individuals mix sessions with and without agents.
    const c = { individuals: 9, inHouseLobbyists: 3, hiredFirms: 4 }
    expect(lobbyistMix(c, "all")).toEqual({
      total: 7,
      inHouse: 3,
      firms: 4,
      agents: null
    })
  })

  it("is null for counts computed before these fields, or none", () => {
    expect(lobbyistMix({ individuals: 2, firmAgents: 0 }, 193)).toBeNull()
    expect(lobbyistMix(undefined, 192)).toBeNull()
    expect(lobbyistMix({}, "all")).toBeNull()
  })
})

describe("lobbyistMixText", () => {
  const t = ((key: string, opts?: Record<string, unknown>) =>
    ({
      "clients.inHouse": `${opts?.count} in-house`,
      "clients.firms": `${opts?.count} firm(s)`,
      "clients.firmsWithAgents": `${opts?.firms} (${opts?.count} agents)`,
      "clients.allInHouse": "all in-house"
    }[key] ?? key)) as unknown as TFunction

  it.each([
    [
      { total: 4, inHouse: 1, firms: 1, agents: 3 },
      "1 in-house · 1 firm(s) (3 agents)"
    ],
    [
      { total: 3, inHouse: 1, firms: 2, agents: null },
      "1 in-house · 2 firm(s)"
    ],
    [{ total: 5, inHouse: 5, firms: 0, agents: 0 }, "all in-house"],
    [{ total: 5, inHouse: 0, firms: 2, agents: 5 }, "2 firm(s) (5 agents)"],
    [{ total: 0, inHouse: 0, firms: 0, agents: null }, "—"],
    [null, "—"]
  ])("words %j as %s", (mix, text) => {
    expect(lobbyistMixText(mix, t)).toBe(text)
  })
})

describe("session labels", () => {
  it.each([
    [194, "194th General Court (2025–26)", "194th (2025–26)"],
    [193, "193rd General Court (2023–24)", "193rd (2023–24)"],
    [191, "191st General Court (2019–20)", "191st (2019–20)"],
    [192, "192nd General Court (2021–22)", "192nd (2021–22)"]
  ])("names the %ith", (n, name, short) => {
    expect(courtName(n)).toBe(name)
    expect(courtShortLabel(n)).toBe(short)
  })
})
