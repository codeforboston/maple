import { currentGeneralCourt } from "functions/src/shared"
import { User, UserCredential } from "firebase/auth"
import {
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc
} from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { ref, uploadBytes } from "firebase/storage"
import { nanoid } from "nanoid"
import { firestore, functions, storage } from "../../components/firebase"
import { terminateFirebase, testDb, testStorage } from "../testUtils"
import {
  createFakeBill,
  expectPermissionDenied,
  expectStorageUnauthorized,
  getBill,
  signInTestAdmin,
  signInUser1,
  signInUser2
} from "./common"
import { act, renderHook } from "@testing-library/react-hooks"
import { useCreateUserWithEmailAndPassword } from "components/auth/hooks"
import { modifyAccount } from "components/moderation"

let uid: string
let user: User
beforeEach(async () => {
  user = await signInUser1()
  uid = user.uid
})

afterAll(terminateFirebase)

async function createPendingUpgradeUser() {
  const { result } = renderHook(() => useCreateUserWithEmailAndPassword(true))
  const info = {
    email: `${nanoid(6)}@example.com`,
    password: "password",
    confirmedPassword: "password",
    fullName: "Test Test"
  }
  let creds!: UserCredential

  await act(async () => {
    creds = await result.current.execute(info)
  })

  const userRef = doc(collection(firestore, "profiles"), creds.user.uid)
  const user = await getDoc(userRef)

  expect(user.exists).toBeTruthy()

  await act(async () => {
    setDoc(
      userRef,
      {
        email: creds.user.email,
        phoneNumber: "123456789",
        website: "www.org.org"
      },
      { merge: true }
    )
  })

  return creds
}

describe("modifyAccount", () => {
  it("finishSignup creates pendingUpgrade accounts", async () => {
    const creds = await createPendingUpgradeUser()

    expect((await creds.user.getIdTokenResult(true)).claims).toMatchObject({
      role: "pendingUpgrade"
    })

    console.log("Created pendingUpgrade user", creds.user.email)
  })

  it("allows admins to update accounts", async () => {
    // Create a pendingupgrade user
    const creds = await createPendingUpgradeUser()

    // Verify that the user is a pendingUpgrade
    expect((await creds.user.getIdTokenResult(true)).claims).toMatchObject({
      role: "pendingUpgrade"
    })

    // Sign in as an admin
    await signInTestAdmin()

    // Call modifyAccount
    await modifyAccount({ role: "organization", uid: creds.user.uid })

    // Verify that the user is an org
    expect((await creds.user.getIdTokenResult(true)).claims).toMatchObject({
      role: "organization"
    })
  })

  it("non-admins are unauthorized", async () => {
    // Create a pendingupgrade user
    const creds = await createPendingUpgradeUser()

    // Sign in as a normal user
    await signInUser1()

    // Verify that calling modifyAccount throws unauthorized error
    await expectPermissionDenied(
      modifyAccount({ role: "organization", uid: creds.user.uid })
    )
  })
})
