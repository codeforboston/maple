import * as functions from "firebase-functions"
import { db, auth } from "../firebase"
import { z } from "zod"
import { checkRequestZod, checkAuth, checkAuthv2 } from "../common"
import { setRole } from "../auth"
import { onCall, CallableRequest } from "firebase-functions/v2/https"

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
})

export const finishSignupv2 = onCall(async (request: CallableRequest) => {
  const uid = checkAuthv2(request, false)

  const { requestedRole } = checkRequestZod(CreateProfileRequest, request.data)

  const {
    fullName,
    orgCategories,
    notificationFrequency,
    email,
    public: isPublic
  } = request.data

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
})
