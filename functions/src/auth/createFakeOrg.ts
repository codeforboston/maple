import * as functions from "firebase-functions"
import { checkAdmin, checkAdminv2, checkAuth, checkAuthv2 } from "../common"
import { auth, db } from "../firebase"
import { onCall, CallableRequest } from "firebase-functions/v2/https"

// for populating admin module for testing & demonstration
//@TODO: remove

export const createFakeOrg = functions.https.onCall(async (data, context) => {
  checkAuth(context, false)
  checkAdmin(context)

  const { uid, fullName, email } = data

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

export const createFakeOrgv2 = onCall(async (request: CallableRequest) => {
  checkAuthv2(request, false)
  checkAdminv2(request)

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
