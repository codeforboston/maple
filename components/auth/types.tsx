import { functions } from "components/firebase"
import { httpsCallable } from "firebase/functions"
import { Role } from "../../functions/src/auth/types"

export * from "../../functions/src/auth/types"

export const finishSignup = httpsCallable<{ requestedRole: Role }, void>(
  functions,
  "finishSignup"
)
