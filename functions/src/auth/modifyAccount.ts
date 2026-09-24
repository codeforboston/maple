import { onCall } from "firebase-functions/v2/https"
import { db, auth } from "../firebase"
import { z } from "zod"
import { checkRequestZod, checkAuth, checkAdmin } from "../common"
import { setRole } from "."

import { ZRole } from "./types"

const Request = z.object({
  uid: z.string(),
  role: ZRole
})

export const modifyAccount = onCall(async request => {
  checkAuth(request, false)
  checkAdmin(request)

  const { uid, role } = checkRequestZod(Request, request.data)

  console.log(`Setting role for ${uid} to ${role}`)

  await setRole({ role, auth, db, uid })
})
