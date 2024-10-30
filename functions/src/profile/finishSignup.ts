import { db, auth } from "../firebase"
import { z } from "zod"
import { checkRequestZod, checkAuth } from "../common"
import { setRole } from "../auth"
import { Role } from "../auth/types"
import { onCall } from "firebase-functions/v2/https"

const CreateProfileRequest = z.object({
  requestedRole: z.enum(["user", "organization", "pendingUpgrade"])
})

export const finishSignup = onCall(async request => {
  const uid = checkAuth(request, false)

  const { requestedRole } = checkRequestZod(CreateProfileRequest, request.data)

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
