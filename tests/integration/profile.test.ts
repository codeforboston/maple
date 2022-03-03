import { waitFor } from "@testing-library/react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { nanoid } from "nanoid"
import { auth, firestore } from "../../components/firebase"
import { terminateFirebase, testAuth, testDb } from "../testUtils"
import { expectPermissionDenied, signInUser1 } from "./common"

const fakeUser = () => ({
  uid: nanoid(),
  displayName: "Conan O'Brien",
  email: `${nanoid()}@example.com`,
  password: "password"
})

const getProfile = (uid: string) =>
  testDb
    .doc(`/profiles/${uid}`)
    .get()
    .then(d => d.data())

afterAll(terminateFirebase)

describe("profile", () => {
  async function expectProfile(newUser: any) {
    await testAuth.createUser(newUser)
    let profile: any
    await waitFor(
      async () => {
        profile = await getProfile(newUser.uid)
        expect(profile).toBeTruthy()
      },
      { timeout: 1000, interval: 250 }
    )
    return profile
  }

  it("Sets the display name for new users", async () => {
    const expected = fakeUser()
    await expect(getProfile(expected.uid)).resolves.toBeUndefined()
    const profile = await expectProfile(expected)
    expect(profile?.displayName).toEqual(expected.displayName)
  })

  it("Is publicly readable", async () => {
    const newUser = fakeUser()
    await expectProfile(newUser)

    await signInUser1()
    const result = await getDoc(doc(firestore, `profiles/${newUser.uid}`))
    expect(result.exists()).toBeTruthy()
  })

  it("Can only be modified by the logged in user", async () => {
    const newUser = fakeUser()
    const profileRef = doc(firestore, `profiles/${newUser.uid}`)
    await expectProfile(newUser)

    await signInUser1()
    await expectPermissionDenied(setDoc(profileRef, { displayName: "test" }))

    await signInWithEmailAndPassword(auth, newUser.email, newUser.password)
    await expect(
      setDoc(profileRef, { displayName: "test" })
    ).resolves.toBeUndefined()
  })
})
