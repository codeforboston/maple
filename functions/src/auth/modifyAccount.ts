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

export const modifyAccount = functions.https.onCall(async (data, context) => {
  checkAuth(context, false)
  checkAdmin(context)

  const { uid, role } = checkRequestZod(Request, data)

  console.log(`Setting role for ${uid} to ${role}`)

  await setRole({ role, auth, db, uid })
})
