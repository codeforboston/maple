import { mapleClient } from "./maple-client"

/**
 * Admin-only route for deleting testimony.
 *
 * Moves testimony from published to archived.
 *
 * @param uid user id, author of the testimony
 * @param tid testimony id
 * @returns 204 response (no body) if successful, or 4XX if not.
 */
export async function deleteTestimony(uid: string, tid: string) {
  return mapleClient.delete(`/api/users/${uid}/testimony/${tid}`)
}
