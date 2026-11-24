/**
 * Server-only helpers for the Ask MAPLE API routes: the signed-in user and the client for the
 * chat-agent service.
 */
import type { NextApiRequest } from "next"
import { auth } from "components/server-api/init-firebase-admin"

/**
 * The uid from the request's Firebase ID token, or null. The agent service trusts this uid, so it
 * only ever comes from a verified token, never from the browser directly.
 */
export async function signedInUid(req: NextApiRequest): Promise<string | null> {
  const header = req.headers.authorization
  if (!header?.startsWith("Bearer ")) return null
  try {
    return (await auth.verifyIdToken(header.slice(7))).uid
  } catch {
    return null
  }
}

/** Calls the chat-agent service as `uid`. Only this server holds the service token. */
export function agent(path: string, uid: string, init: RequestInit = {}) {
  return fetch(`${agentUrl()}${path}`, {
    ...init,
    headers: {
      ...agentHeaders(uid),
      "content-type": "application/json",
      ...(init.headers as Record<string, string>)
    }
  })
}

export const agentUrl = () =>
  process.env.CHAT_AGENT_URL ?? "http://127.0.0.1:2024"

export const agentHeaders = (uid: string) => ({
  authorization: `Bearer ${process.env.AGENT_SERVICE_TOKEN ?? ""}`,
  "x-ask-maple-user": uid
})

export type ThreadSummary = { id: string; title: string; updatedAt: string }

async function ok(res: Response) {
  if (!res.ok) throw new Error(`chat-agent ${res.status}`)
  return res.json()
}

/** The rail: this user's threads (the service scopes every route to the caller). */
export const listThreads = (uid: string): Promise<ThreadSummary[]> =>
  agent("/threads", uid).then(ok)

export const createThread = (
  uid: string,
  title: string
): Promise<{ id: string }> =>
  agent("/threads", uid, {
    method: "POST",
    body: JSON.stringify({ title })
  }).then(ok)
