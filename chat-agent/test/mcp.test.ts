import {
  mcpBill,
  mcpCaller,
  mcpTestimony,
  rpcBody,
  type McpCall
} from "../src/mcp"
import { buildTools } from "../src/tools"

// Trimmed from real maple-dev responses (2026-11-01); author names replaced.
const BILL = {
  relevanceScore: 0.75,
  id: "H1507",
  path: "generalCourts/194/bills/H1507",
  court: 194,
  title: "An Act limiting rent increases and creating a rental arbitrator",
  primarySponsor: "William C. Galvin",
  summary: " The bill proposes to limit how much landlords can increase rent.",
  currentCommittee: { id: "J24", name: "Joint Committee on Housing" },
  endorseCount: 3,
  opposeCount: 1,
  neutralCount: 0,
  testimonyCount: 4,
  nextHearingAt: { _seconds: 0, _nanoseconds: 0 }
}
const TESTIMONY = {
  relevanceScore: 0.822,
  id: "-emmD2hOXM0Hv8s4H4jSx",
  path: "users/someUid/publishedTestimony/-emmD2hOXM0Hv8s4H4jSx",
  authorDisplayName: "Test Author",
  billId: "H5008",
  court: 194,
  position: "endorse",
  publishedAt: { _seconds: 1775839528, _nanoseconds: 197000000 },
  contentPreview: "go rent control!"
}

const sse = (msg: unknown) => `event: message\ndata: ${JSON.stringify(msg)}\n\n`
const toolResult = (v: unknown, isError = false) => ({
  jsonrpc: "2.0",
  id: 1,
  result: { content: [{ type: "text", text: JSON.stringify(v) }], isError }
})

describe("mcp mapping", () => {
  test("bill: counts, committee name, trimmed summary", () => {
    expect(mcpBill(BILL)).toEqual({
      id: "H1507",
      court: 194,
      title: BILL.title,
      primarySponsor: "William C. Galvin",
      summary:
        "The bill proposes to limit how much landlords can increase rent.",
      committee: "Joint Committee on Housing",
      testimonyCounts: { support: 3, oppose: 1, neutral: 0 }
    })
    expect(mcpBill({ ...BILL, currentCommittee: null }).committee).toBeNull()
  })

  test("testimony: endorse → support, timestamp → ISO, no uid path", () => {
    const t = mcpTestimony(TESTIMONY)
    expect(t.position).toBe("support")
    expect(t.publishedAt).toBe("2026-04-10T16:45:28.000Z")
    expect(JSON.stringify(t)).not.toContain("someUid")
  })
})

describe("mcpCaller", () => {
  const realFetch = global.fetch
  afterEach(() => (global.fetch = realFetch))
  const respond = (status: number, body: string) =>
    (global.fetch = jest.fn(
      async () => new Response(body, { status })
    ) as unknown as typeof fetch)

  test("parses an SSE tool result and sends the token header", async () => {
    respond(200, sse(toolResult([BILL])))
    const out = await mcpCaller("https://x.test/api/mcp", "tok")(
      "search_bills",
      {
        query: "rent"
      }
    )
    expect(out).toEqual([BILL])
    const init = (global.fetch as jest.Mock).mock.calls[0][1]
    expect(init.headers["X-Maple-Token"]).toBe("Bearer tok")
    expect(JSON.parse(init.body).params).toEqual({
      name: "search_bills",
      arguments: { query: "rent" }
    })
  })

  test("plain JSON bodies pass through", () => {
    expect(rpcBody('{"a":1}')).toBe('{"a":1}')
  })

  test("HTTP errors and tool errors throw without echoing the token", async () => {
    const call = mcpCaller("https://x.test/api/mcp", "secret-tok")
    respond(401, '{"error":"Unauthorized"}')
    await expect(call("search_bills", {})).rejects.toThrow("HTTP 401")
    respond(200, sse(toolResult("bad query", true)))
    await expect(call("search_bills", {})).rejects.toThrow(/bad query/)
    respond(401, "")
    await expect(call("search_bills", {})).rejects.not.toThrow(/secret-tok/)
  })
})

describe("tools on MCP", () => {
  const unused = {} as any
  const fake = (results: Record<string, unknown>) => {
    const mcp = jest.fn(async (name: string) => results[name]) as jest.Mock &
      McpCall
    const [searchBills, searchTestimony, listSponsors] = buildTools({
      db: unused,
      embed: unused,
      mcp
    })
    return { mcp, searchBills, searchTestimony, listSponsors }
  }

  test("search_bills returns the agent's bill shape", async () => {
    const { searchBills } = fake({ search_bills: [BILL] })
    const [hit] = JSON.parse(
      await searchBills.invoke({ query: "rent", limit: 3 })
    )
    expect(hit.testimonyCounts).toEqual({ support: 3, oppose: 1, neutral: 0 })
  })

  test("billId becomes policyId", async () => {
    const { mcp, searchTestimony } = fake({ search_testimony: [TESTIMONY] })
    await searchTestimony.invoke({ query: "rent", billId: "H5008", limit: 3 })
    expect(mcp).toHaveBeenCalledWith("search_testimony", {
      query: "rent",
      limit: 3,
      policyType: "bill",
      policyId: "H5008"
    })
    await searchTestimony.invoke({ query: "rent", limit: 3 })
    expect(mcp).toHaveBeenLastCalledWith("search_testimony", {
      query: "rent",
      limit: 3
    })
  })

  test("list_sponsors filters names locally", async () => {
    const { listSponsors } = fake({
      list_sponsors: ["Adam J. Scanlon", "William C. Galvin", "Carole A. Fiola"]
    })
    expect(JSON.parse(await listSponsors.invoke({ query: "galvin" }))).toEqual([
      "William C. Galvin"
    ])
    expect(JSON.parse(await listSponsors.invoke({}))).toHaveLength(3)
  })
})
