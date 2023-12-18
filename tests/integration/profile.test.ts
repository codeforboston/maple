import { waitFor } from "@testing-library/react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { nanoid } from "nanoid"
import { auth, firestore } from "../../components/firebase"
import { terminateFirebase, testAuth } from "../testUtils"
import {
  expectPermissionDenied,
  getProfile,
  setNewProfile,
  signInTestAdmin,
  signInUser,
  signInUser1,
  signInUser2
} from "./common"

const fakeUser = () => ({
  uid: nanoid(),
  fullName: "Sparks Nevada",
  email: `${nanoid()}@example.com`,
  password: "password"
})

afterAll(terminateFirebase)

describe("profile", () => {
  async function expectProfile(newUser: any) {
    await testAuth.createUser(newUser)
    await setNewProfile(newUser)

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

  it("Sets the fullName for new users", async () => {
    const expected = fakeUser()
    expect(await getProfile(expected)).toBeUndefined()
    const profile = await expectProfile(expected)
    expect(profile.fullName).toEqual(expected.fullName)
    expect(profile.role).not.toBeDefined()
  })

  it("Is publicly readable when public", async () => {
    await signInTestAdmin()

    const user = fakeUser()
    await expectProfile(user)
    expect((await getProfile({ uid: user.uid }))?.public).toBeUndefined()

    await setDoc(
      doc(firestore, `/profiles/${user.uid}`),
      { public: true },
      { merge: true }
    )

    const profile = await getProfile({ uid: user.uid })
    expect(profile?.public).toBeDefined()
    expect(profile?.public).toBeTruthy()

    await signInUser2()
    // expect permission to be granted
    expect(
      (await getDoc(doc(firestore, `profiles/${user.uid}`))).data()
    ).toBeTruthy()
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

  it("Is always readable to owner", async () => {
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
    // user cannot change their own role
    await expectPermissionDenied(updateDoc(profileRef, { role: "any" }))
    // user cannot delete their own profile
    await expectPermissionDenied(deleteDoc(profileRef))
  })

  async function setPublic(doc: any, isPublic: boolean) {
    await setDoc(doc, { public: isPublic }, { merge: true })
  }
})
