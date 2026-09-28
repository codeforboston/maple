import * as functions from "firebase-functions"
import { onCall } from "firebase-functions/v2/https"
import type { CallableRequest } from "firebase-functions/v2/https"
import { db, auth } from "../firebase"
import { z } from "zod"
import { checkRequestZod, checkAuth, checkAdmin } from "../common"
import { setRole } from "."

import { ZRole } from "./types"

const Request = z.object({
  uid: z.string(),
  role: ZRole
})

const handleModifyAccount = async (request: CallableRequest) => {
  checkAuth(request, false)
  checkAdmin(request)

  const { uid, role } = checkRequestZod(Request, request.data)

  console.log(`Setting role for ${uid} to ${role}`)

  await setRole({ role, auth, db, uid })
}

export const modifyAccount = functions.https.onCall((data, context) =>
  handleModifyAccount({ data, auth: context.auth } as CallableRequest)
)
export const modifyAccountV2 = onCall(handleModifyAccount)
