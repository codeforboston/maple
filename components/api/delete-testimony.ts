import { httpsCallable } from "firebase/functions"
import { auth, functions } from "../firebase"

/**
 * Admin-only route for deleting testimony.
 *
 * Moves testimony from published to archived and updates counts.
 *
 * @param uid user id, author of the testimony
 * @param tid testimony id
 * @returns 204 response (no body) if successful, or 4XX if not.
 */

export async function deleteTestimony(uid: string, tid: string) {
  const user = auth.currentUser
  if (!user) throw new Error("Not logged in.")

  try {
    const callable = httpsCallable(functions, "deleteTestimony")
    const res = await callable({ uid, publicationId: tid })
    return res.data
  } catch (err: any) {
    const msg =
      err?.message ||
      err?.code ||
      "Delete failed"
    throw new Error(msg)
  }
}
