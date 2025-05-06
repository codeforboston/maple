import * as functions from "firebase-functions"
import { db, auth } from "../firebase"
import { z } from "zod"
import { checkRequestZod, checkAuth } from "../common"
import { setRole } from "../auth"

const CreateProfileRequest = z.object({
  requestedRole: z.enum(["user", "organization", "pendingUpgrade"])
})

export const finishSignup = functions.https.onCall(async (data, context) => {
  const uid = checkAuth(context, false)

  const { requestedRole } = checkRequestZod(CreateProfileRequest, data)

  const {
    fullName,
    orgCategories,
    notificationFrequency,
    email,
    public: isPublic
  } = data

  // Only an admin can approve organizations, after they've signed up initially
  // There's a nextjs api route: PATCH /users/<uid> {"role": <role>}
  if (requestedRole === "organization") {
    await setRole({
      role: "pendingUpgrade",
      auth,
      db,
      uid,
      newProfile: { fullName, email, orgCategories }
    })
  } else {
    await setRole({
      role: "user",
      auth,
      db,
      uid,
      newProfile: { fullName, notificationFrequency, email, public: isPublic }
    })
  }
})
