import { signInWithEmailAndPassword } from "firebase/auth"
import { httpsCallable } from "firebase/functions"
import { auth, functions } from "../components/firebase"

const submitTestimony = httpsCallable<any, any>(functions, "submitTestimony")

describe("submitTestimony", () => {
  it("allows submitting testimony", async () => {
    await signInWithEmailAndPassword(auth, "test@example.com", "password")
    try {
      const result = await submitTestimony({
        testimony: "test testimony",
        position: "endorse",
        court: 192,
        billId: "H1"
      })
      expect(result.data.status).toBe("ok")
      expect(result.data.testimonyRef).toBeDefined()
    } catch (e) {
      console.log(e)
    }
  })
})
