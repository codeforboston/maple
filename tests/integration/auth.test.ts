import { nanoid } from "nanoid"
import { setRole } from "../../functions/src/auth"
import { terminateFirebase, testAuth, testDb } from "../testUtils"
import { getProfile } from "./common"

const fakeUser = () => ({
  uid: nanoid(),
  displayName: "Conan O'Brien",
  email: `${nanoid()}@example.com`,
  password: "password"
})

afterAll(terminateFirebase)

describe("setRole", () => {
  const ctx = { auth: testAuth, db: testDb }
  const createUser = async () => {
    const newUser = fakeUser()
    await testAuth.createUser(newUser)
    const user = await testAuth.getUser(newUser.uid)
    expect(user.customClaims).toBeUndefined()
    return user
  }

  it("sets user claims by email", async () => {
    const user = await createUser()
    const role = "user"
    await setRole({ email: user.email, ...ctx, role })

    const updated = (await testAuth.getUser(user.uid)).customClaims
    expect(updated).toEqual({ role })

    const profile = (await getProfile(user))!
    expect(profile.role).toEqual(role)
  })

  it("sets user claims by uid", async () => {
    const user = await createUser()

    const role = "user"
    await setRole({ uid: user.uid, ...ctx, role })

    const updated = (await testAuth.getUser(user.uid)).customClaims
    expect(updated).toEqual({ role })

    const profile = (await getProfile(user))!
    expect(profile.role).toEqual(role)
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
