import * as functions from "firebase-functions"
import { db, auth } from "../firebase"
import { z } from "zod"
import { checkRequestZod, checkAuth } from "../common"
import { setRole } from "../auth"

const CreateProfileRequest = z.object({
  requestedRole: z.enum(["user", "organization"])
})

export const createProfile = functions.https.onCall(async (data, context) => {
  const uid = checkAuth(context, false)

  const { requestedRole } = await checkRequestZod(CreateProfileRequest, data)

  const role = requestedRole === "user" ? "user" : "pendingUpgrade"

  await setRole({ role, auth, db, uid })
})
