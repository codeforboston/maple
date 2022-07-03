import { nanoid } from "nanoid"
import { setRole } from "../../functions/src/auth"
import { terminateFirebase, testAuth } from "../testUtils"

const fakeUser = () => ({
  uid: nanoid(),
  displayName: "Conan O'Brien",
  email: `${nanoid()}@example.com`,
  password: "password"
})

afterAll(terminateFirebase)

describe("setRole", () => {
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
    await setRole({ email: user.email, auth: testAuth, role })

    const updated = (await testAuth.getUser(user.uid)).customClaims
    expect(updated).toEqual({ role })
  })

  it("sets user claims by uid", async () => {
    const user = await createUser()

    const role = "user"
    await setRole({ uid: user.uid, auth: testAuth, role })

    const updated = (await testAuth.getUser(user.uid)).customClaims
    expect(updated).toEqual({ role })
  })
  it("rejects bad input", async () => {
    const user = await createUser()

    // missing id
    await expect(setRole({ role: "user", auth: testAuth })).rejects.toThrow()
    // invalid id
    await expect(
      setRole({ uid: "invalid", role: "user", auth: testAuth })
    ).rejects.toThrow()
    // invalid email
    await expect(
      setRole({ email: "invalid@example.com", role: "user", auth: testAuth })
    ).rejects.toThrow()
    // invalid role
    await expect(
      setRole({ role: "invalid" as any, uid: user.uid, auth: testAuth })
    ).rejects.toThrow()
  })
})
