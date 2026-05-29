import * as admin from "firebase-admin"
import { Request, Response, NextFunction } from "express"

export async function hybridAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing token" })
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

    return res.status(401).json({ error: "Unauthorized: Invalid token" })
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
