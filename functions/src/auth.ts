import { UserRecord } from "firebase-admin/lib/auth/user-record"
import { Literal as L, Static, Union } from "runtypes"
import { Auth, Database } from "./types"

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
  auth,
  db
}: {
  email?: string
  uid?: string
  role: Role
  auth: Auth
  db: Database
}) => {
  let user: UserRecord
  if (email) user = await auth.getUserByEmail(email)
  else if (uid) user = await auth.getUser(uid)
  else throw Error("Missing uid or email")

  const claim: Claim = { role: Role.check(role) }
  await auth.setCustomUserClaims(user.uid, claim)

  const profile = db.doc(`/profiles/${user.uid}`)
  await profile.set({ role }, { merge: true })
}
