import { act } from "@testing-library/react-hooks"
import { Role, finishSignup } from "components/auth"
import { CreateUserWithEmailAndPasswordData } from "components/auth/hooks"
import { modifyAccount } from "components/moderation"
import { UserCredential, deleteUser, signOut, User } from "firebase/auth"
import { nanoid } from "nanoid"
import { auth } from "../../components/firebase"
import { terminateFirebase, testAuth } from "../testUtils"
import { UserRecord } from "firebase-admin/auth"

import {
  createUser,
  expectCurrentUser,
  expectCurrentUserAdmin,
  expectPermissionDenied,
  expectUser,
  genUserInfo,
  signInTestAdmin,
  signInUser,
  signInUser1,
  testCreatePendingOrgWithEmailAndPassword
} from "./common"

// afterAll(terminateFirebase)

describe("admins can modify user role", () => {
  it("lets admin make user an org", async () => {
    let user: UserRecord = await createUser()
    const admin = await signInTestAdmin()

    expect((await admin.getIdTokenResult()).claims.role).toEqual("admin")

    await modifyAccount({ uid: user.uid, role: "organization" })

    await expectUser(user, "organization", true)
  })

  it("lets admin make user an admin", async () => {
    let user: UserRecord = await createUser("user")
    await signInTestAdmin()
    await modifyAccount({ uid: user.uid, role: "admin" })

    await expectUser(user, "admin", true)
  })
  it("allows admins to update accounts", async () => {
    await signOut(auth)
    const newUser = genUserInfo()

    const creds = await testCreatePendingOrgWithEmailAndPassword(auth, newUser)

    // Verify that the user is a pendingUpgrade
    expect((await creds.user.getIdTokenResult(true)).claims).toMatchObject({
      role: "pendingUpgrade"
    })

    // Sign in as an admin
    await signInTestAdmin()
    await expectCurrentUserAdmin()

    await modifyAccount({ uid: creds.user.uid, role: "organization" })

    // Verify that the user is an org
    expect((await creds.user.getIdTokenResult(true)).claims["role"]).toEqual(
      "organization"
    )
    await signOut(auth)
    expectCurrentUser()
  })

  it("non-admins are unauthorized", async () => {
    const user = genUserInfo()
    // Create a pendingupgrade user
    const creds = await testCreatePendingOrgWithEmailAndPassword(auth, user)
    // Sign in as a normal user
    await signInUser1()
    // Verify that calling modifyAccount throws unauthorized error
    await expectPermissionDenied(
      modifyAccount({ role: "organization", uid: creds.user.uid })
    )
  })
})

describe("finishSignup", () => {
  it("assigns organization request pendingupgrade role", async () => {
    const user = await createUser()

    expect(user).toBeDefined()

    await signInUser(user.email!)

    await finishSignup({ requestedRole: "organization" })

    const updated = (await auth.currentUser?.getIdTokenResult(true))?.claims
    expect(updated?.role).toEqual("pendingUpgrade")
  })

  it("create user with email hook creates pendingUpgrade accounts", async () => {
    const newUser: CreateUserWithEmailAndPasswordData = {
      email: `${nanoid(6)}@example.com`,
      password: "password",
      confirmedPassword: "password",
      fullName: `Test ${nanoid(4)}`
    }

    await signInTestAdmin()

    const creds: UserCredential =
      await testCreatePendingOrgWithEmailAndPassword(auth, newUser)

    expectCurrentUser(creds.user)

    expect(creds).toBeDefined()
    const token = await creds.user.getIdTokenResult(true)
    expect(token.claims).toMatchObject({
      role: "pendingUpgrade"
    })

    await act(() => testAuth.deleteUser(creds.user.uid))

    expect(testAuth.getUser(creds.user.uid)).rejects.toThrow()

    await signOut(auth)
  })
})
