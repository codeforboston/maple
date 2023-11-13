import { act, renderHook } from "@testing-library/react-hooks"
import { UserCredential } from "firebase/auth"
import { nanoid } from "nanoid"
import { terminateFirebase, testDb } from "../../tests/testUtils"
import { useCreateUserWithEmailAndPassword } from "./hooks"

afterAll(terminateFirebase)

describe.skip("useCreateUserWithEmailAndPassword", () => {
  it("creates user and profile", async () => {
    const { result } = renderHook(() =>
      useCreateUserWithEmailAndPassword(false)
    )
    const info = {
      email: `${nanoid()}@example.com`,
      password: "password",
      confirmedPassword: "password",
      fullName: "Test Test"
    }
    let creds!: UserCredential
    await act(async () => {
      creds = await result.current.execute(info)
    })
    const profile = await testDb.doc(`/profiles/${creds.user.uid}`).get()
    expect(profile.data()).toMatchObject({
      fullName: info.fullName,
      role: "user",
      public: false,
      notificationFrequency: "Monthly",
      email: info.email
    })
  })
})
