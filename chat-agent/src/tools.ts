import { tool, type ToolRuntime } from "langchain"
import { z } from "zod"
import * as db from "./db"
import { mcpBill, mcpTestimony, type McpCall } from "./mcp"

// Queries ≤ 500 chars, limit ≤ 8, ISO dates. user_id never appears in a schema.
const query = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .describe("What to search for, in plain words")
const limit = z
  .number()
  .int()
  .min(1)
  .max(8)
  .default(5)
  .describe("Maximum results (1-8)")
// A plain string: Gemini rejects the $ref a reused or union schema would emit.
const isoDate = () =>
  z
    .string()
    .refine(
      v => /^\d{4}-\d{2}-\d{2}/.test(v) && !isNaN(Date.parse(v)),
      "ISO date, e.g. 2026-10-01"
    )
    .describe("ISO date, e.g. 2026-10-01")

/** Bill, testimony and sponsor search go to MAPLE's MCP server; memory search to our own db. */
export type ToolDeps = { db: db.Queryable; embed: db.EmbedFn; mcp: McpCall }

/** A Firebase uid, verified by the site before it reaches this service. */
export const UserId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/)

const json = (v: unknown) => JSON.stringify(v)

/** The Next.js runtime route sets it, as LangGraph context; tests may pass it in configurable. */
export function userIdFrom(runtime: {
  context?: unknown
  configurable?: Record<string, unknown>
}): string {
  const id =
    (runtime.context as { user_id?: unknown } | undefined)?.user_id ??
    runtime.configurable?.user_id
  if (typeof id !== "string" || !UserId.safeParse(id).success)
    throw new Error("configurable.user_id is missing or not a user id")
  return id
}

// shortcut: only query/limit/billId of mcp-server's filters are exposed; add topic/committee/court when evals need them.
export function buildTools(deps: ToolDeps) {
  const searchBills = tool(
    async ({ query, limit }, runtime: ToolRuntime) => {
      runtime.writer?.(`Searching bills for "${query}"`)
      const hits = (await deps.mcp("search_bills", { query, limit })) as any[]
      return json(hits.map(mcpBill))
    },
    {
      name: "search_bills",
      description:
        "Search Massachusetts bills by meaning. Returns id, court, title, primary sponsor, a short summary, committee and testimonyCounts {support, oppose, neutral}.",
      schema: z.object({ query, limit })
    }
  )

  const searchTestimony = tool(
    async ({ query, billId, limit }, runtime: ToolRuntime) => {
      runtime.writer?.(`Reading testimony${billId ? ` on ${billId}` : ""}`)
      const hits = (await deps.mcp("search_testimony", {
        query,
        limit,
        ...(billId && { policyType: "bill", policyId: billId })
      })) as any[]
      return json(hits.map(mcpTestimony))
    },
    {
      name: "search_testimony",
      description:
        "Search public testimony residents and organizations submitted on bills. Optionally restrict to one bill id (e.g. H1234). Returns position (support/oppose/neutral), author, date and a 300-character preview.",
      schema: z.object({
        query,
        billId: z
          .string()
          .trim()
          .max(20)
          .optional()
          .describe("Only testimony on this bill id"),
        limit
      })
    }
  )

  const listSponsors = tool(
    async ({ query }, runtime: ToolRuntime) => {
      runtime.writer?.("Looking up sponsors")
      // mcp-server returns names only and has no name filter.
      const names = (await deps.mcp("list_sponsors", {})) as string[]
      const q = query?.toLowerCase()
      return json(
        names.filter(n => !q || n.toLowerCase().includes(q)).slice(0, 200)
      )
    },
    {
      name: "list_sponsors",
      description:
        "List primary sponsors of bills in the current session. Optionally filter by part of a legislator's name.",
      schema: z.object({
        query: z
          .string()
          .trim()
          .min(1)
          .max(100)
          .optional()
          .describe("Part of a sponsor's name")
      })
    }
  )

  const searchMyPastChats = tool(
    async ({ query, since, until }, runtime: ToolRuntime) => {
      const userId = userIdFrom(runtime)
      runtime.writer?.("Checking your past chats")
      const vec = await deps.embed(query, "query")
      return json(
        await db.searchMemories(deps.db, userId, vec, {
          since,
          until,
          limit: 5
        })
      )
    },
    {
      name: "search_my_past_chats",
      description:
        "Search this user's own earlier conversations. Use when they refer to something they asked before. Dates are ISO (YYYY-MM-DD).",
      schema: z.object({
        query,
        since: isoDate().optional(),
        until: isoDate().optional()
      })
    }
  )

  return [
    searchBills,
    searchTestimony,
    listSponsors,
    searchMyPastChats
  ] as const
}
