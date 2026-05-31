/**
 * Server-side proxy for the MAPLE MCP server running on Cloud Run.
 *
 * Flow:
 *   Client → POST /api/mcp  (Authorization: Bearer <MAPLE_TOKEN>)
 *     → this proxy fetches a Google identity token for the Cloud Run URL
 *     → forwards request to Cloud Run with:
 *         Authorization: Bearer <GOOGLE_ID_TOKEN>   (satisfies Cloud Run IAM)
 *         X-Maple-Authorization: Bearer <MAPLE_TOKEN>  (validated by MCP auth middleware)
 *
 * The Cloud Run URL never appears in any client config, keeping it private.
 *
 * Environment variables:
 *   MCP_SERVER_URL — Cloud Run service URL (set in hosting env, never exposed to browser)
 */

import type { NextApiRequest, NextApiResponse } from "next"
import { GoogleAuth } from "google-auth-library"

// Disable Next.js body parsing so we can forward the raw JSON buffer
export const config = {
  api: { bodyParser: false }
}

const auth = new GoogleAuth()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const mcpUrl = process.env.MCP_SERVER_URL
  if (!mcpUrl) {
    return res.status(503).json({ error: "MCP service not configured" })
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  const mapleAuth = req.headers.authorization
  if (!mapleAuth) {
    return res.status(401).json({ error: "Unauthorized: Missing token" })
  }

  try {
    // Get a short-lived Google identity token scoped to the Cloud Run service URL
    const client = await auth.getIdTokenClient(mcpUrl)
    const idTokenHeaders = await client.getRequestHeaders()

    // Buffer the request body to forward it
    const bodyChunks: Buffer[] = []
    for await (const chunk of req) {
      bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const body = Buffer.concat(bodyChunks)

    const upstream = await fetch(`${mcpUrl}/mcp`, {
      method: "POST",
      headers: {
        // Google identity token for Cloud Run IAM
        Authorization: idTokenHeaders.Authorization,
        // MAPLE token forwarded for the MCP auth middleware
        "X-Maple-Authorization": mapleAuth,
        "Content-Type": req.headers["content-type"] ?? "application/json",
        "Content-Length": body.length.toString()
      },
      body
    })

    // Forward status and headers back to the client
    res.status(upstream.status)
    const ct = upstream.headers.get("content-type")
    if (ct) res.setHeader("Content-Type", ct)

    const responseBody = await upstream.arrayBuffer()
    res.end(Buffer.from(responseBody))
  } catch (err) {
    console.error("MCP proxy error:", err)
    if (!res.headersSent) {
      res.status(502).json({ error: "Bad Gateway" })
    }
  }
}
