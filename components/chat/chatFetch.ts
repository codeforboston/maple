import { auth } from "../firebase"

/** The signed-in user's Firebase ID token header; getIdToken refreshes it when it has expired. */
export async function authHeader(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** fetch for the /api/chat routes, as the signed-in user. */
export async function chatFetch(input: string, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers as Record<string, string>),
      ...(await authHeader())
    }
  })
}
