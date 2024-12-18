import * as functions from "firebase-functions"
import { db, auth } from "../firebase"
import { z } from "zod"
import { checkRequestZod, checkAuth, checkAdmin } from "../common"
import { setRole } from "."

import { ZRole } from "./types"

const Request = z.object({
  uid: z.string(),
  role: ZRole
})

export const modifyAccount = functions.https.onCall(async request => {
  checkAuth(request, false)
  checkAdmin(request)

  const { uid, role } = checkRequestZod(Request, request.data)

  await setRole({ role, auth, db, uid })
})
