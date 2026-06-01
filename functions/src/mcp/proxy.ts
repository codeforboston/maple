import * as functions from "firebase-functions"

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

    // Firebase Functions strips the Authorization header from allUsers-accessible
    // functions before the code runs. Clients must use X-Maple-Token instead.
    const mapleAuth =
      (req.headers["x-maple-token"] as string | undefined) ??
      req.headers.authorization
    if (!mapleAuth) {
      res.status(401).json({
        error: "Unauthorized: Missing token",
        help: "Visit https://mapletestimony.org/learn/ai-tools for setup instructions."
      })
      return
    }

    try {
      // Use GCP metadata server to get an identity token for Cloud Run IAM.
      // This is the most reliable approach in any GCP-hosted environment.
      const metadataUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(mcpUrl)}&format=full`
      const tokenRes = await fetch(metadataUrl, {
        headers: { "Metadata-Flavor": "Google" }
      })
      const idToken = await tokenRes.text()

      const body = JSON.stringify(req.body)

      const upstream = await fetch(`${mcpUrl}/mcp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "X-Maple-Authorization": mapleAuth.startsWith("Bearer ")
            ? mapleAuth
            : `Bearer ${mapleAuth}`,
          "Content-Type": req.headers["content-type"] ?? "application/json",
          ...(req.headers["accept"] && { Accept: req.headers["accept"] as string }),
          ...(req.headers["mcp-protocol-version"] && {
            "MCP-Protocol-Version": req.headers["mcp-protocol-version"] as string
          })
        },
        body
      })

      const responseBody = await upstream.arrayBuffer()
      res.status(upstream.status)
      const ct = upstream.headers.get("content-type")
      if (ct) res.setHeader("Content-Type", ct)
      res.end(Buffer.from(responseBody))
    } catch (err) {
      functions.logger.error("MCP proxy error", err)
      if (!res.headersSent) {
        res.status(502).json({ error: "Bad Gateway" })
      }
    }
  })
