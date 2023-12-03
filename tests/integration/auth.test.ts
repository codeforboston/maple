import { UserRecord } from "firebase-admin/auth"
import { nanoid } from "nanoid"
import { Role } from "../../components/auth"
import { setRole } from "../../functions/src/auth"
import { terminateFirebase, testAuth, testDb } from "../testUtils"
import { getProfile } from "./common"

const fakeUser = () => ({
  uid: nanoid(),
  fullName: "Conan O'Brien",
  email: `${nanoid()}@example.com`,
  password: "password"
})

// afterAll(terminateFirebase)

describe("setRole", () => {
  const ctx = { auth: testAuth, db: testDb }
  const createUser = async () => {
    const newUser = fakeUser()
    await testAuth.createUser(newUser)
    const user = await testAuth.getUser(newUser.uid)
    expect(user.customClaims).toBeUndefined()
    return user
  }

  const expectUser = async (
    user: UserRecord,
    role: Role,
    isPublic: boolean
  ) => {
    const updated = (await testAuth.getUser(user.uid)).customClaims
    expect(updated).toEqual({ role })

    const profile = (await getProfile(user))!
    expect(profile.role).toEqual(role)
    expect(profile.public).toBe(isPublic)
  }

  it.each<[string, (u: any) => any]>([
    ["uid", u => ({ uid: u.uid })],
    ["email", u => ({ email: u.email })]
  ])("sets claims by %s", async (_, extract) => {
    const user = await createUser()
    const role = "user"
    await setRole({ ...extract(user), ...ctx, role })
    expectUser(user, role, false)
  })

  it.each<[string, (u: any) => any]>([
    ["uid", u => ({ uid: u.uid })],
    ["email", u => ({ email: u.email })]
  ])("sets claims by %s", async (_, extract) => {
    const user = await createUser()
    const role = "organization"
    await setRole({ ...extract(user), ...ctx, role })
    expectUser(user, role, true)
  })

  it.each<[Role, boolean]>([
    ["user", false],
    ["admin", false],
    ["legislator", false],
    ["organization", true],
    ["pendingUpgrade", false]
  ])("sets claims for %s", async (role, expectedPublic) => {
    const user = await createUser()
    await setRole({ uid: user.uid, ...ctx, role })
    expectUser(user, role, expectedPublic)
  })

  it("rejects bad input", async () => {
    const user = await createUser()

    // missing id
    await expect(setRole({ role: "user", ...ctx })).rejects.toThrow()
    // invalid id
    await expect(
      setRole({ uid: "invalid", role: "user", ...ctx })
    ).rejects.toThrow()
    // invalid email
    await expect(
      setRole({ email: "invalid@example.com", role: "user", ...ctx })
    ).rejects.toThrow()
    // invalid role
    await expect(
      setRole({ role: "invalid" as any, uid: user.uid, ...ctx })
    ).rejects.toThrow()
  })
})
