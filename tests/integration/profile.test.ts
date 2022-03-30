import { waitFor } from "@testing-library/react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { nanoid } from "nanoid"
import { auth, firestore } from "../../components/firebase"
import { terminateFirebase, testAuth, testDb } from "../testUtils"
import {
  expectPermissionDenied,
  signInUser,
  signInUser1,
  signInUser2
} from "./common"

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
      { timeout: 5000, interval: 250 }
    )
    return profile
  }

  it("Sets the display name for new users", async () => {
    const expected = fakeUser()
    await expect(getProfile(expected.uid)).resolves.toBeUndefined()
    const profile = await expectProfile(expected)
    expect(profile?.displayName).toEqual(expected.displayName)
  })

  it("Is publicly readable by default", async () => {
    const newUser = fakeUser()
    await expectProfile(newUser)

    await signInUser1()
    const result = await getDoc(doc(firestore, `profiles/${newUser.uid}`))
    expect(result.exists()).toBeTruthy()
  })

  it("Is publicly readable when public", async () => {
    const user1 = await signInUser1()
    const profileRef = doc(firestore, `profiles/${user1.uid}`)
    setDoc(profileRef, { public: true })

    await signInUser2()
    const result = await getDoc(doc(firestore, `profiles/${user1.uid}`))
    expect(result.exists()).toBeTruthy()
  })

  it("Is not publicly readable when not public", async () => {
    const user1 = await signInUser1()
    const profileRef = doc(firestore, `profiles/${user1.uid}`)
    setDoc(profileRef, { public: false })

    await signInUser2()
    await expectPermissionDenied(
      getDoc(doc(firestore, `profiles/${user1.uid}`))
    )
  })

  it("Is readable when not public by own user", async () => {
    const user1 = await signInUser1()
    const profileRef = doc(firestore, `profiles/${user1.uid}`)
    setDoc(profileRef, { public: false })

    const result = await getDoc(doc(firestore, `profiles/${user1.uid}`))
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
