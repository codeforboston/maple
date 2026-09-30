import { onCall } from "firebase-functions/v2/https"
import type { CallableRequest } from "firebase-functions/v2/https"
import { checkAdmin, checkAuth } from "../common"
import { auth, db } from "../firebase"

// for populating admin module for testing & demonstration
//@TODO: remove

export const createFakeOrgV2 = onCall(async (request: CallableRequest) => {
  checkAuth(request, false)
  checkAdmin(request)

  const { uid, fullName, email } = request.data

  const newUser = {
    uid,
    fullName,
    email,
    password: "password",
    public: true,
    role: "pendingUpgrade"
  }

  const role = "pendingUpgrade"
  const userRecord = await auth.createUser(newUser)

  await auth.setCustomUserClaims(newUser.uid, { role })
  await db.doc(`/profiles/${newUser.uid}`).set(newUser)

  const authUser = (await db.doc(`/profiles/${newUser.uid}`).get()).data()

  console.log(authUser)

  return { ...authUser, uid: userRecord.uid }
})
