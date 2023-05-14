import { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"
import { auth, db } from "../../../components/server-api/init-firebase-admin"
import { ensureAdminAuthenticated } from "../../../components/server-api/middleware-fns"

/**
 * Routes for changes to user
 * /users/[uid]
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    // Used to change the user's role, e.g. upgrade "pendingUpgrade"
    // to "organization"
    case "PATCH":
      return await patch(req, res)
    default:
      res.status(404).end()
  }
}

const QuerySchema = z.object({
  uid: z.string()
})

// TODO: match with the cloud function Role type
const ROLES = [
  "user", // Regular old
  "admin", // Can do anything, set in the db manually for now
  "pendingUpgrade", // Sign up as org, admin has to manually upgrade
  "organization" // An upgraded organization approved by an admin
] as const

const BodySchema = z.object({
  role: z.enum(ROLES)
})

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const { query, body } = req

  // only admins can access this
  const token = await ensureAdminAuthenticated(req, res)
  if (!token) {
    return
  }
  const queryValidation = QuerySchema.safeParse(query)
  const bodyValidation = BodySchema.safeParse(body)

  if (!queryValidation.success) {
    return res.status(404).json({
      error: queryValidation.error
    })
  }
  if (!bodyValidation.success) {
    return res.status(400).json({
      error: bodyValidation.error
    })
  }
  const { uid } = queryValidation.data
  const { role } = bodyValidation.data

  // check if the user exists
  try {
    const user = await auth.getUser(uid)

    // Set the claim for the JWT
    await auth.setCustomUserClaims(user.uid, { role })
    // Set on the profiles collection for the admin dashboard
    await db.doc(`profiles/${uid}`).set(
      {
        role
      },
      { merge: true }
    )
    return res.status(200).json({
      data: user
    })
  } catch (exception) {
    console.error(exception)
    return res.status(404).json({
      error: "User doesn't exist."
    })
  }
}
