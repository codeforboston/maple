import { act } from "@testing-library/react-hooks"
import { upgradeOrganization } from "components/api/upgrade-org"
import { OrgCategory, Role, finishSignup } from "components/auth"
import { CreateUserWithEmailAndPasswordData } from "components/auth/hooks"
import { setProfile } from "components/db"
import { modifyAccount } from "components/moderation"
import { fakeUser } from "components/moderation/setUp/MockRecords"
import {
  UserCredential,
  createUserWithEmailAndPassword,
  deleteUser,
  signOut
} from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { nanoid } from "nanoid"
import { auth, firestore } from "../../components/firebase"
import { terminateFirebase, testAuth } from "../testUtils"
import {
  createUser,
  expectCurrentUser,
  expectPermissionDenied,
  expectUser,
  genUserInfo,
  getProfile,
  signInTestAdmin,
  signInUser,
  signInUser1,
  testCreatePendingOrgWithEmailAndPassword
} from "./common"
// let uid: string
// let user: User
// beforeEach(async () => {
//   user = await signInUser1()
//   uid = user.uid
// })

afterAll(terminateFirebase)

// ways to be a user:
// user info
// user auth
// user profile
// isCurrentUser (is logged in)

describe("basic user moves", () => {
  it("creates a user", async () => {
    const user = await createUser()
    expect(user).toBeDefined()
    expect(user.email).toBeDefined()

    let currentUser = auth.currentUser
    expect(currentUser).toBeNull()

    await signInUser(user.email!)

    currentUser = auth.currentUser
    expect(currentUser).toBeDefined()
    await signOut(auth)
  })

  it("creates a pending user", async () => {
    const info = {
      email: `${nanoid(6)}@example.com`,
      fullName: `Test ${nanoid(4)}`,
      password: "password",
      confirmedPassword: "password",
      orgCategory: "Other" as OrgCategory
    }

    const infoUser = await createUserWithEmailAndPassword(
      auth,
      info.email,
      info.password
    )

    expect(infoUser.user).toBeDefined()
  })

  it("can tell if a user is logging in", async () => {
    await signOut(auth)
    const user = await createUser()

    expectCurrentUser()

    user.email && (await signInUser(user.email))

    expectCurrentUser(user)

    await signOut(auth)

    expectCurrentUser()
  })

  it("sets a profile", async () => {
    await signInTestAdmin()
    const userInfo = { ...fakeUser(), role: "user" as Role }
    await setProfile(userInfo.uid, userInfo)
    const profile = await getDoc(doc(firestore, `/profiles/${userInfo.uid}`))
    expect(profile.data()).toMatchObject(userInfo)
    await signOut(auth)
  })
})

describe("modifyAccount", () => {
  it("runs", async () => {
    const user = await createUser()
    expect(user?.email).toBeDefined()

    const adminUser = await signInTestAdmin()
    const admin = await testAuth.getUser(adminUser.uid)
    expect(admin).toBeDefined()

    const role = "user"
    const isPublic = true
    expect(user).toBeDefined()
    await expectUser(admin, "admin", false)

    await modifyAccount({ uid: user.uid, role })
      .then(async () => await expectUser(user, role, isPublic))
      .catch(async err => console.log({ err }))

    await modifyAccount({ uid: user.uid, role: "organization" })

    await expectUser(user, "organization" as Role, isPublic)

    await modifyAccount({ uid: user.uid, role: "admin" })

    await expectUser(user, "admin" as Role, isPublic)

    await signOut(auth)
  })
})

describe("finishSignup_create new user", () => {
  it("finishSignup callable assigns organization request to role pendingupgrade", async () => {
    const user = await createUser()

    const isPublic = true
    expect(user).toBeDefined()

    await signInUser(user.email!)

    await finishSignup({ requestedRole: "organization" })

    const updated = (await auth.currentUser?.getIdTokenResult(true))?.claims
    expect(updated?.role).toEqual("pendingUpgrade")

    await signOut(auth)
    expectCurrentUser()
    await signInUser(user.email!)
    expectCurrentUser(user)

    await act(async () => await deleteUser(auth.currentUser!))
  })

  it("create user with email hook creates pendingUpgrade accounts", async () => {
    const newUser = {
      email: `${nanoid(6)}@example.com`,
      password: "password",
      confirmedPassword: "password",
      fullName: `Test ${nanoid(4)}`
    } as CreateUserWithEmailAndPasswordData

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

  it("allows admins to update accounts", async () => {
    await signOut(auth)
    const newUser = genUserInfo()

    const creds = await testCreatePendingOrgWithEmailAndPassword(auth, newUser)

    // Sign in as an admin
    await signInTestAdmin()

    // Verify that the user is a pendingUpgrade
    expect((await creds.user.getIdTokenResult(true)).claims).toMatchObject({
      role: "pendingUpgrade"
    })

    // Call modifyAccount

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

  it("updates or using the api upgradeOrganization", async () => {
    await signInTestAdmin()

    const user = await createUser("pendingUpgrade")

    const profile = await getProfile({ uid: user.uid })
    await upgradeOrganization(user.uid)
    expect(profile).toBeDefined()
    console.log(profile!.role)
    expect(profile!.role).toEqual("organization")
  })
})
