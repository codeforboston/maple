import * as functions from "firebase-functions"
import { GoogleAuth } from "google-auth-library"

const auth = new GoogleAuth()

/**
 * Firebase Function proxy for the MAPLE MCP server on Cloud Run.
 *
 * Exposed at: /api/mcp  (via Firebase Hosting rewrite)
 * Target:     MCP_SERVER_URL env var (Cloud Run, --no-allow-unauthenticated)
 *
 * Header flow:
 *   Client → Authorization: Bearer <MAPLE_TOKEN>
 *   Proxy  → Authorization: Bearer <GOOGLE_ID_TOKEN>  (Cloud Run IAM)
 *            X-Maple-Authorization: Bearer <MAPLE_TOKEN>  (MCP auth middleware)
 */
export const mcpProxy = functions
  .runWith({ timeoutSeconds: 30, memory: "256MB" })
  .https.onRequest(async (req, res) => {
    const mcpUrl = process.env.MCP_SERVER_URL
    if (!mcpUrl) {
      res.status(503).json({ error: "MCP service not configured" })
      return
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" })
      return
    }

    const mapleAuth = req.headers.authorization
    if (!mapleAuth) {
      res.status(401).json({ error: "Unauthorized: Missing token" })
      return
    }

    try {
      const client = await auth.getIdTokenClient(mcpUrl)
      const idTokenHeaders = await client.getRequestHeaders() as unknown as Record<string, string>

      const body = JSON.stringify(req.body)

      const upstream = await fetch(`${mcpUrl}/mcp`, {
        method: "POST",
        headers: {
          Authorization: idTokenHeaders["Authorization"],
          "X-Maple-Authorization": mapleAuth,
          "Content-Type": "application/json"
        },
        body
      })

      res.status(upstream.status)
      const ct = upstream.headers.get("content-type")
      if (ct) res.setHeader("Content-Type", ct)

      const responseBody = await upstream.arrayBuffer()
      res.end(Buffer.from(responseBody))
    } catch (err) {
      functions.logger.error("MCP proxy error", err)
      if (!res.headersSent) {
        res.status(502).json({ error: "Bad Gateway" })
      }
    }
  })
