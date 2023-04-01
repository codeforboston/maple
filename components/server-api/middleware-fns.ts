import { NextApiRequest, NextApiResponse } from "next"
import { auth } from "./init-firebase-admin"

// https://nextjs.org/docs/advanced-features/middleware#producing-a-response
export const config = {
  matcher: "/api/:function*"
}

/**
 * Ensures that a request has a header with
 *
 * "authorization": "Bearer <token>"
 *
 * where the <token> is the id token for Firebase.
 *
 * See https://firebase.google.com/docs/auth/admin/verify-id-tokens#node.js
 *
 * @param request a next request
 */
async function getToken(request: NextApiRequest) {
  const { headers } = request
  if (!headers.authorization) {
    return false
  }
  const value = headers.authorization
  if (!value.startsWith("Bearer ")) {
    return false
  }
  const token = value.slice("Bearer ".length)
  return await auth.verifyIdToken(token, true)
}

const AUTHENTICATION_FAILED_MESSAGE = "authentication failed"

export async function ensureAuthenticated(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const token = await getToken(request)
  if (!token) {
    response.status(401).json({ error: AUTHENTICATION_FAILED_MESSAGE })
    return undefined
  }
  return token
}

export async function ensureAdminAuthenticated(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const token = await ensureAuthenticated(request, response)
  if (!token) {
    return
  }
  if (token.role !== "admin") {
    response.status(403).json({ error: AUTHENTICATION_FAILED_MESSAGE })
    return
  }
  return token
}
