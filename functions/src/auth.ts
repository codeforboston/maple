import { Auth } from "firebase-admin/lib/auth/auth"
import { UserRecord } from "firebase-functions/v1/auth"
import { Literal as L, Static, Union } from "runtypes"

export const Role = Union(
  L("user"),
  L("admin"),
  L("legislator"),
  L("organization")
)
export type Role = Static<typeof Role>

export type Claim = {
  role: Role
}

export const setRole = async ({
  email,
  uid,
  role,
  auth
}: {
  email?: string
  uid?: string
  role: Role
  auth: Auth
}) => {
  let user: UserRecord
  if (email) user = await auth.getUserByEmail(email)
  else if (uid) user = await auth.getUser(uid)
  else throw Error("Missing uid or email")

  const claim: Claim = { role: Role.check(role) }
  await auth.setCustomUserClaims(user.uid, claim)
}
