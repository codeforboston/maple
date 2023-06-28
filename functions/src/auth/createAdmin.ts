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

  if (!validateIsUid(input))
    throw new functions.https.HttpsError("unknown", "Invalid input")

  const isEmail = validateIsEmail(input)

  let user: UserRecord

  try {
    if (isEmail) {
      user = await auth.getUserByEmail(input)
    } else {
      user = await auth.getUser(input)
    }

    console.log("setting role", user.uid)
    return await setRole({ role: "admin", uid: user.uid, auth, db })
      .then(d => d)
      .catch(e => {
        console.log(e)
      })
  } catch (e) {
    if (e instanceof functions.https.HttpsError) throw e
    throw new functions.https.HttpsError(
      "invalid-argument",
      `${isEmail ? "email" : "user"} not found`
    )
  }
})

const email = z.string().email()
type Email = z.infer<typeof email>

const uidstring = z.string().min(1).max(128)
type UidString = z.infer<typeof uidstring>

function validateIsEmail(input: string): input is Email {
  return email.safeParse(input).success
}
function validateIsUid(input: string): input is UidString {
  return uidstring.safeParse(input).success
}
