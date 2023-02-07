import { act, renderHook } from "@testing-library/react-hooks"
import { UserCredential } from "firebase/auth"
import { nanoid } from "nanoid"
import { terminateFirebase, testDb } from "../../tests/testUtils"
import { useCreateUserWithEmailAndPassword } from "./hooks"

afterAll(terminateFirebase)

describe("useCreateUserWithEmailAndPassword", () => {
  it("creates user and profile", async () => {
    const { result } = renderHook(() => useCreateUserWithEmailAndPassword())
    const info = {
      email: `${nanoid()}@example.com`,
      password: "password",
      confirmedPassword: "password",
      fullName: "Test Test",
      nickname: "test"
    }
    let creds!: UserCredential
    await act(async () => {
      creds = await result.current.execute(info)
    })
    const profile = await testDb.doc(`/profiles/${creds.user.uid}`).get()
    expect(profile.data()).toMatchObject({
      displayName: info.nickname,
      fullName: info.fullName,
      role: "user",
      public: false
    })
  })
})
