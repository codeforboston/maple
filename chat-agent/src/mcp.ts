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

/** Calls one MAPLE MCP tool and returns its parsed JSON result. */
export type McpCall = (
  name: string,
  args: Record<string, unknown>
) => Promise<unknown>

// shortcut: one stateless JSON-RPC POST per call, no initialize handshake (mcp-server runs stateless);
// switch to the MCP SDK client if the server starts requiring sessions.
export function mcpCaller(
  url: string,
  token: string,
  timeoutMs = 20_000
): McpCall {
  let id = 0
  return async (name, args) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        // The Firebase proxy strips Authorization, so the token goes in X-Maple-Token.
        "X-Maple-Token": `Bearer ${token}`
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: ++id,
        method: "tools/call",
        params: { name, arguments: args }
      }),
      signal: AbortSignal.timeout(timeoutMs)
    })
    if (!res.ok) throw new Error(`MCP ${name}: HTTP ${res.status}`)
    const msg = JSON.parse(rpcBody(await res.text()))
    if (msg.error) throw new Error(`MCP ${name}: ${msg.error.message}`)
    const text = (msg.result?.content ?? [])
      .map((c: { text?: string }) => c.text ?? "")
      .join("")
    if (msg.result?.isError) throw new Error(`MCP ${name}: ${text}`)
    return JSON.parse(text)
  }
}

/** Streamable HTTP may answer as SSE: the JSON-RPC message is in the data lines. */
export function rpcBody(body: string): string {
  if (!body.startsWith("event:") && !body.startsWith("data:")) return body
  return body
    .split("\n")
    .filter(l => l.startsWith("data:"))
    .map(l => l.slice(5).trim())
    .join("\n")
}

/** Firestore timestamps arrive as {_seconds, _nanoseconds}; 0 means unset. */
const isoFrom = (t: any): string | null =>
  typeof t === "string"
    ? t
    : t?._seconds
    ? new Date(t._seconds * 1000).toISOString()
    : null

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
