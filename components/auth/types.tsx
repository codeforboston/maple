import { functions } from "components/firebase"
import { httpsCallable } from "firebase/functions"
import { Role } from "../../functions/src/auth/types"
import { Profile } from "components/db"

export * from "../../functions/src/auth/types"

export const finishSignup = httpsCallable<
  { requestedRole: Role } | Partial<Profile>,
  void
>(functions, "finishSignup")
