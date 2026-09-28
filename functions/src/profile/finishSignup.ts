import * as functions from "firebase-functions"
import { onCall } from "firebase-functions/v2/https"
import type { CallableRequest } from "firebase-functions/v2/https"
import { db, auth } from "../firebase"
import { z } from "zod"
import { checkRequestZod, checkAuth } from "../common"
import { setRole } from "../auth"

const CreateProfileRequest = z.object({
  requestedRole: z.enum(["user", "organization", "pendingUpgrade"])
})

const handleFinishSignup = async (request: CallableRequest) => {
  const uid = checkAuth(request, false)

  const { requestedRole } = checkRequestZod(CreateProfileRequest, request.data)

  const {
    fullName,
    orgCategories,
    notificationFrequency,
    email,
    public: isPublic
  } = request.data

  // Only an admin can approve organizations, after they've signed up initially
  // There's a nextjs api route: PATCH /users/<uid> {"role": <role>}
  if (requestedRole === "organization") {
    await setRole({
      role: "organization",
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
}

export const finishSignup = functions.https.onCall((data, context) =>
  handleFinishSignup({ data, auth: context.auth } as CallableRequest)
)
export const finishSignupV2 = onCall(handleFinishSignup)
