import {
  initFirestore,
  listSponsors,
  searchBills,
  searchTestimony
} from "../../mcp-server/queries"

/** The bill shape the model and the chat's bill cards read. */
export type BillHit = {
  id: string
  court: number
  title: string | null
  primarySponsor: string | null
  summary: string | null
  committee: string | null
  testimonyCounts: { support: number; oppose: number; neutral: number }
}

export type TestimonyHit = {
  id: string
  billId: string
  court: number
  position: string
  authorDisplayName: string | null
  publishedAt: string | null
  contentPreview: string
}

/** Runs one of MAPLE's MCP tool queries and returns its result. */
export type McpCall = (
  name: string,
  args: Record<string, unknown>
) => Promise<unknown>

const direct: Record<string, (args: unknown) => Promise<unknown>> = {
  search_bills: searchBills,
  search_testimony: searchTestimony,
  list_sponsors: listSponsors
}

/** Runs the MCP server's queries in-process, against the Firestore of this service's project. */
export function directCaller(): McpCall {
  initFirestore()
  return async (name, args) => {
    const query = direct[name]
    if (!query) throw new Error(`Unknown MAPLE tool ${name}`)
    return query(args)
  }
}

/** A Firestore Timestamp, or null. */
const isoFrom = (t: any): string | null => t?.toDate?.().toISOString() ?? null

export function mcpBill(b: any): BillHit {
  return {
    id: b.id,
    court: b.court,
    title: b.title?.trim() ?? null,
    primarySponsor: b.primarySponsor ?? null,
    summary: b.summary ? b.summary.trim().slice(0, 300) : null,
    committee: b.currentCommittee?.name ?? null,
    testimonyCounts: {
      support: b.endorseCount ?? 0,
      oppose: b.opposeCount ?? 0,
      neutral: b.neutralCount ?? 0
    }
  }
}

// Drops `path`: it carries the author's Firebase uid.
export function mcpTestimony(t: any): TestimonyHit {
  return {
    id: t.id,
    billId: t.billId,
    court: t.court,
    position: t.position === "endorse" ? "support" : t.position,
    authorDisplayName: t.authorDisplayName ?? null,
    publishedAt: isoFrom(t.publishedAt),
    contentPreview: t.contentPreview ?? ""
  }
}
