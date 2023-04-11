import { waitFor } from "@testing-library/react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { nanoid } from "nanoid"
import { auth, firestore } from "../../components/firebase"
import { setRole } from "../../functions/src/auth"
import { terminateFirebase, testAuth, testDb } from "../testUtils"
import {
  expectPermissionDenied,
  getProfile,
  signInUser,
  signInUser1,
  signInUser2
} from "./common"

const fakeUser = () => ({
  uid: nanoid(),
  fullName: "Conan O'Brien",
  email: `${nanoid()}@example.com`,
  password: "password"
})

afterAll(terminateFirebase)

describe("profile", () => {
  async function expectProfile(newUser: any) {
    await testAuth.createUser(newUser)
    let profile: any
    await waitFor(
      async () => {
        profile = await getProfile(newUser)
        expect(profile).toBeTruthy()
      },
      { timeout: 5000, interval: 250 }
    )
    return profile
  }

  it("Sets the display name and role for new users", async () => {
    const expected = fakeUser()
    await expect(getProfile(expected)).resolves.toBeUndefined()
    const profile = await expectProfile(expected)
    expect(profile.fullName).toEqual(expected.fullName)
    expect(profile.role).toEqual("user")
  })

  it("Is not publicly readable by default", async () => {
    const newUser = fakeUser()
    await expectProfile(newUser)

    await signInUser1()
    await expectPermissionDenied(
      getDoc(doc(firestore, `profiles/${newUser.uid}`))
    )
  })

  it("Is publicly readable when public", async () => {
    const user1 = await signInUser1()
    const profileRef = doc(firestore, `profiles/${user1.uid}`)
    await setPublic(profileRef, true)

    await signInUser2()
    const result = await getDoc(doc(firestore, `profiles/${user1.uid}`))
    expect(result.exists()).toBeTruthy()
  })

  it("Is not publicly readable when not public", async () => {
    const user1 = await signInUser1()
    const profileRef = doc(firestore, `profiles/${user1.uid}`)
    await setPublic(profileRef, false)

    await signInUser2()
    await expectPermissionDenied(
      getDoc(doc(firestore, `profiles/${user1.uid}`))
    )
  })

  it("Is readable when not public by own user", async () => {
    const user1 = await signInUser1()
    const profileRef = doc(firestore, `profiles/${user1.uid}`)
    await setPublic(profileRef, false)

    const result = await getDoc(doc(firestore, `profiles/${user1.uid}`))
    expect(result.exists()).toBeTruthy()
  })

  it("Can only be modified by the logged in user", async () => {
    const newUser = fakeUser()
    const profileRef = doc(firestore, `profiles/${newUser.uid}`)
    await expectProfile(newUser)

    await signInUser1()
    await expectPermissionDenied(
      setDoc(profileRef, { fullName: "test" }, { merge: true })
    )

    await signInWithEmailAndPassword(auth, newUser.email, newUser.password)
    await expect(
      setDoc(profileRef, { fullName: "test" }, { merge: true })
    ).resolves.toBeUndefined()
  })

  it("Does not allow deleting the profile or changing the role", async () => {
    const newUser = fakeUser()
    const profileRef = doc(firestore, `profiles/${newUser.uid}`)
    await expectProfile(newUser)
    await signInUser(newUser.email)

    await expectPermissionDenied(updateDoc(profileRef, { role: "admin" }))
    await expectPermissionDenied(deleteDoc(profileRef))
  })

  it("Does not allow setting public for non-user roles", async () => {
    const newUser = fakeUser()
    const profileRef = doc(firestore, `profiles/${newUser.uid}`)
    await expectProfile(newUser)
    await setRole({
      uid: newUser.uid,
      role: "legislator",
      auth: testAuth,
      db: testDb
    })
    await signInUser(newUser.email)

    await expectPermissionDenied(updateDoc(profileRef, { public: false }))
  })

  async function setPublic(doc: any, isPublic: boolean) {
    await setDoc(doc, { public: isPublic }, { merge: true })
  }
})
