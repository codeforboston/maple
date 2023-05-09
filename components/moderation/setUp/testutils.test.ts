import { Profile } from "components/db"
import { loremIpsum } from "lorem-ipsum"
import { nanoid } from "nanoid"
import { testDb, testAuth, testAdmin } from "tests/testUtils"

describe("moderating pending orgs", () => {
  const fakeUser = (
    uid?: string
  ): Profile & {
    uid: string
    id?: string
    email?: string
    password?: string
  } => ({
    uid: uid ?? "usr" + nanoid(5),
    fullName: loremIpsum({ count: 2, units: "words" }),
    email: `${nanoid(4)}@example.com`,
    password: "password",
    public: true,
    role: "pendingUpgrade"
  })

  const createFakeOrg = async () => {
    const newUser = fakeUser()
    const role = "pendingUpgrade"
    const userRecord = await testAuth.createUser(newUser)
    await testAuth.setCustomUserClaims(newUser.uid, { role })
    await testDb
      .doc(`/profiles/${newUser.uid}`)
      .set(newUser)

    const authUser = (await testDb.doc(`/profiles/${newUser.uid}`).get()).data()

    console.log(authUser)
    return authUser
  }

  it("creates a new pending org", async () => {
    const newUser = await createFakeOrg()

    console.log(newUser)
    expect(await testDb.collection("profiles").get()).not.toBeNull()
    // expect(testAuth.getUser(newUser.uid)).toBeDefined()
  })
})
