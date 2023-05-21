import { functions } from "components/firebase"
import { httpsCallable } from "firebase/functions"

export * from "../../functions/src/auth/types"

export const finishSignup = httpsCallable<
  { requestedRole: "user" | "organization" },
  void
>(functions, "finishSignup")
