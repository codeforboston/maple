import { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { db } from "../../../../../components/server-api/init-firebase-admin"
import { ensureAdminAuthenticated } from "../../../../../components/server-api/middleware-fns"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "DELETE":
      return await _delete(req, res)
    default:
      res.status(404).end()
  }
}

const QuerySchema = z.object({
  uid: z.string(),
  tid: z.string()
})

/**
 * Admin-only route for deleting testimony.
 *
 * Moves testimony from published to archived in firestore.
 *
 * 204 no content if successful.
 */
async function _delete(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req
  const token = await ensureAdminAuthenticated(req, res)
  if (!token) {
    return
  }
  const queryValidation = QuerySchema.safeParse(query)
  if (!queryValidation.success) {
    return res.status(400).json({
      error: queryValidation.error
    })
  }
  const { uid, tid } = queryValidation.data

  const testimonyRef = await db.doc(`users/${uid}/publishedTestimony/${tid}`)
  const testimonySnapshot = await testimonyRef.get()
  if (!testimonySnapshot.exists) {
    return res.status(404).json({
      error: "Testimony doesn't exist."
    })
  }
  const testimony = testimonySnapshot.data()

  // add to archived
  await db.doc(`users/${uid}/archivedTestimony/${tid}`).set({ ...testimony })

  // remove from published
  await testimonyRef.delete()

  // ChatGPT recommmended this as the best return code for a DELETE
  res.status(204).end()
}
