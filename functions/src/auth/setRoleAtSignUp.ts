import { auth, db } from "../firebase"
import { setRole } from "./auth"
import { Role } from "./types"

export const setRoleAtSignUp = (uid: string, role: Role) => {
  const props = {
    uid,
    role,
    auth,
    db
  }

  return setRole(props)
}
