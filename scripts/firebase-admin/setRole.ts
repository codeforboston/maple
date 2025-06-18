import { Record, String } from "runtypes"
import { setRole } from "../../functions/src/auth"
import { Role } from "common/auth/types"
import { Script } from "./types"

const Args = Record({ email: String, role: Role })
export const script: Script = async ({ auth, db, args }) => {
  const { email, role } = Args.check(args)
  const emails = email.split(" ")
  for (const email of emails) {
    await setRole({ email, role, auth, db })
  }
}
