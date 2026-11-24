import type { McpCall } from "../src/mcp"

/** MCP server stand-in: one bill (in mcp-server's shape), no testimony, two sponsors. */
export const fakeMcp =
  (delayMs = 0): McpCall =>
  async name => {
    if (delayMs) await new Promise(r => setTimeout(r, delayMs))
    if (name === "search_bills")
      return [
        {
          id: "H1440",
          court: 192,
          title: "An Act relative to the stabilization of rents",
          endorseCount: 0,
          opposeCount: 0,
          neutralCount: 0
        }
      ]
    if (name === "list_sponsors") return ["Jane Doe", "John Roe"]
    return []
  }
