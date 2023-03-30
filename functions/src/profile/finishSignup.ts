import * as functions from "firebase-functions"
import { db, auth } from "../firebase"
import { z } from "zod"
import { checkRequestZod, checkAuth } from "../common"
import { setRole } from "../auth"

const CreateProfileRequest = z.object({
  requestedRole: z.enum(["user", "organization"])
})

export const finishSignup = functions.https.onCall(async (data, context) => {
  const uid = checkAuth(context, false)

  const { requestedRole } = checkRequestZod(CreateProfileRequest, data)

  // TODO: set role to pendingUpgrade if user requests to be an organization
  const role = requestedRole === "user" ? "user" : "organization"

  await setRole({ role, auth, db, uid })
})
