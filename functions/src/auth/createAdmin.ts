import * as functions from "firebase-functions"
import { checkAdmin, checkAuth } from "../common"
import { auth, db } from "../firebase"
import { setRole } from "./setRole"

export const createAdmin = functions.https.onCall(async (data, ctx) => {
  const uid = data.uid

  checkAuth(ctx, false)
  checkAdmin(ctx)

  if (!uid || typeof uid !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "Invalid uid")
  }

  try {
    await setRole({ role: "admin", uid, auth, db })
  } catch (e) {
    throw new functions.https.HttpsError("internal", "setRole failed", e)
  }

  return
})
