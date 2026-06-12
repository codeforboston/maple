import * as admin from "firebase-admin"
import { Request, Response, NextFunction } from "express"

export async function hybridAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Header precedence (highest to lowest):
  //   X-Maple-Authorization — set by the Firebase Function proxy
  //   X-Maple-Token         — set by MCP clients (Firebase strips Authorization on allUsers functions)
  //   Authorization         — direct connections (local stdio, curl testing)
  const authHeader =
    (req.headers["x-maple-authorization"] as string | undefined) ??
    (req.headers["x-maple-token"] as string | undefined) ??
    req.headers.authorization
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized: Missing token",
      help: "A MAPLE account and API token are required. Visit https://mapletestimony.org/learn/ai-tools for setup instructions."
    })
  }

  try {
    // 1. Try to verify as Firebase ID Token
    try {
      const decodedToken = await admin.auth().verifyIdToken(token)
      ;(req as any).user = decodedToken
      return next()
    } catch (e) {
      // Not a valid Firebase token, proceed to Agent Key check
    }

    // 2. Try to verify as Agent Key
    // We use the token itself as the document ID in the agentKeys collection
    const keyDoc = await admin
      .firestore()
      .collection("agentKeys")
      .doc(token)
      .get()

    if (keyDoc.exists) {
      const data = keyDoc.data()
      if (data?.active === false) {
        return res
          .status(403)
          .json({ error: "Forbidden: Agent key is inactive" })
      }
      ;(req as any).agent = data
      return next()
    }

    return res.status(401).json({
      error: "Unauthorized: Invalid token",
      help: "Visit https://mapletestimony.org/learn/ai-tools to get a valid MAPLE API token."
    })
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
