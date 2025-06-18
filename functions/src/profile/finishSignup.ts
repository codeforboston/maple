import * as functions from "firebase-functions"
import { db, auth } from "../firebase"
import { z } from "zod"
import { checkRequestZod, checkAuth } from "../common"
import { setRole } from "../auth"
import { Role } from "../../../common/auth/types"

const CreateProfileRequest = z.object({
  requestedRole: z.enum(["user", "organization", "pendingUpgrade"])
})

export const finishSignup = functions.https.onCall(async (data, context) => {
  const uid = checkAuth(context, false)

  const { requestedRole } = checkRequestZod(CreateProfileRequest, data)

  let role: Role = "user"

  // Only an admin can approve organizations, after they've signed up initially
  // There's a nextjs api route: PATCH /users/<uid> {"role": <role>}
  if (requestedRole === "organization") {
    role = "pendingUpgrade"
  }

  await setRole({ role, auth, db, uid })

  // upgrade requests table pulls from the profiles collection
  await db.doc(`profiles/${uid}`).set(
    {
      role
    },
    { merge: true }
  )
})
