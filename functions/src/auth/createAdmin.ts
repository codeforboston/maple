import * as functions from "firebase-functions"
import { checkAdmin, checkAuth } from "../common"
import { auth, db } from "../firebase"
import { UserRecord } from "firebase-admin/auth"
import { setRole } from "./setRole"
import { z } from "zod"

export const createAdmin = functions.https.onCall(async (data, ctx) => {
  checkAuth(ctx, false)
  checkAdmin(ctx)

  const { input } = data

  let user: UserRecord

  if (!input) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid input")
  }

  if (validateIsEmail(input)) {
    try {
      user = await auth.getUserByEmail(input)
    } catch (e) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid email")
    }
  } else {
    try {
      user = await auth.getUser(input)
    } catch (e) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid uid")
    }
  }

  return await setRole({ role: "admin", uid: user.uid, auth, db })
})

const email = z.string().email()
type Email = z.infer<typeof email>

function validateIsEmail(input: string): input is Email {
  return z.string().email().safeParse(input).success
}
