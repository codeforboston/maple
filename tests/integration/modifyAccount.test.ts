import { auth, functions } from "../../components/firebase"
import { terminateFirebase, testAuth, testDb } from "../testUtils"

import { Role } from "components/auth"
import { signOut } from "firebase/auth"
import { httpsCallable } from "firebase/functions"
import {
  expectPermissionDenied,
  genUserInfo,
  signInTestAdmin,
  signInUser
} from "./common"

afterAll(terminateFirebase)


const modifyAccount = httpsCallable<{ uid: string; role: Role }, void>(
  functions,
  "modifyAccount"
)

describe("admins can modify user role", () => {
  beforeEach(async () => {
    await signOut(auth)
  })

  it("allows admins to modify user roles ", async () => {
    const userInfo = genUserInfo()
    const user = await testAuth.createUser(userInfo)
    testDb.doc(`profiles/${user.uid}`).set({ role: "user" }, { merge: true })

    await signInTestAdmin()
    await modifyAccount({ uid: user.uid, role: "admin" })

    expect(((await testAuth.getUser(user.uid)).customClaims?.role)).toEqual("admin")

  })

  it("doesn't allow non-admins to modify user roles", async () => {
    const userInfo = genUserInfo()
    const user = await testAuth.createUser(userInfo)
    testDb.doc(`profiles/${user.uid}`).set({ role: "user" }, { merge: true })

    await signInUser(userInfo.email)


    // tries to run modifyAccount as a regular "user" role
    await expectPermissionDenied(modifyAccount({ uid: user.uid, role: "legislator" }))

  })
})
