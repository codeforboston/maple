import * as functions from "firebase-functions/v1"
import { checkAdmin, checkAuth } from "../common"
import { auth, db } from "../firebase"

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
