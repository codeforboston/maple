/**
 * HTTP/SSE entry point for the MAPLE MCP server.
 *
 * Uses StreamableHTTPServerTransport (stateless mode) so every POST /mcp
 * request gets its own transport + server instance — correct for a stateless
 * RAG service where there is no long-lived session state.
 *
 * Auth: hybridAuthMiddleware runs before the MCP handler, accepting either
 *   • Firebase ID Token  (issued by the MAPLE web app)
 *   • Agent Key          (stored in Firestore agentKeys/{key})
 *
 * Local testing:
 *   conda run -n maple-2025 node_modules/.bin/ts-node index-http.ts
 *   curl http://localhost:3001/health
 *   curl -X POST http://localhost:3001/mcp \
 *        -H "Authorization: Bearer <token>" \
 *        -H "Content-Type: application/json" \
 *        -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
 *
 * Environment variables:
 *   PORT                      — defaults to 3001
 *   HOST                      — defaults to 127.0.0.1 (use 0.0.0.0 for Cloud Run)
 *   FIREBASE_PROJECT_ID       — required
 *   GOOGLE_APPLICATION_CREDENTIALS — required (ADC path)
 *   DISABLE_AUTH              — set to "true" to skip auth (local dev only)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js"
import * as admin from "firebase-admin"
import { Request, Response, NextFunction } from "express"
import dotenv from "dotenv"
import { registerTools } from "./tools"
import { hybridAuthMiddleware } from "./auth"
import { rateLimitMiddleware } from "./rateLimit"

dotenv.config()

// ── Firebase Admin ────────────────────────────────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID })
}

// ── Config ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? "3001", 10)
const HOST = process.env.HOST ?? "127.0.0.1"
const DISABLE_AUTH = process.env.DISABLE_AUTH === "true"

// ── MCP server factory ────────────────────────────────────────────────────────
// We create a fresh McpServer per request (stateless mode).
function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "maple-mcp-server",
    version: "0.1.0"
  })
  registerTools(server)
  return server
}

// ── Auth middleware ───────────────────────────────────────────────────────────
const authMiddleware = DISABLE_AUTH
  ? (_req: Request, _res: Response, next: NextFunction) => next()
  : hybridAuthMiddleware

if (DISABLE_AUTH) {
  console.warn("⚠️  DISABLE_AUTH=true — authentication is OFF. Local dev only.")
}

// ── Express app ───────────────────────────────────────────────────────────────
const app = createMcpExpressApp({ host: HOST })

// Health check — no auth required
app.get("/health", (_req, res) => {
  res.json({ status: "ok", server: "maple-mcp-server", version: "0.1.0" })
})

// MCP endpoint — auth then rate limit, new transport per request (stateless)
app.post(
  "/mcp",
  authMiddleware,
  rateLimitMiddleware,
  async (req: Request, res: Response) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined // stateless: no session tracking
    })

    const server = createMcpServer()

    // Clean up when the response finishes
    res.on("finish", () => {
      transport
        .close()
        .catch(err => console.error("Error closing transport:", err))
    })

    try {
      await server.connect(transport)
      await transport.handleRequest(req, res, req.body)
    } catch (err) {
      console.error("Error handling MCP request:", err)
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error" })
      }
    }
  }
)

// Reject GET /mcp — we're stateless, no persistent SSE stream
app.get("/mcp", (_req, res) => {
  res.status(405).json({
    error: "Method Not Allowed",
    detail:
      "This server uses stateless Streamable HTTP. Send POST requests to /mcp."
  })
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, HOST, () => {
  console.log(`MAPLE MCP HTTP server listening on http://${HOST}:${PORT}`)
  console.log(`  Health: http://${HOST}:${PORT}/health`)
  console.log(`  MCP:    http://${HOST}:${PORT}/mcp`)
  console.log(
    `  Auth:   ${
      DISABLE_AUTH ? "DISABLED" : "enabled (Firebase ID Token or Agent Key)"
    }`
  )
})
