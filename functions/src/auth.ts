import { UserRecord } from "firebase-admin/lib/auth/user-record"
import { Literal as L, Record, Static, Union } from "runtypes"
import { Auth, Database } from "./types"

export const Role = Union(
  L("user"),
  L("admin"),
  L("legislator"),
  L("organization")
)
export type Role = Static<typeof Role>

/** Custom-claim payload used for authorization. */
export const Claim = Record({
  role: Role
})
export type Claim = Static<typeof Claim>

/** Auth-related user state, stored on the user profile. */
export const UserAuth = Record({
  // The current role
  role: Role
})

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

  const claim = Claim.check({ role })
  await auth.setCustomUserClaims(user.uid, claim)

  const userAuth = UserAuth.check({ role })
  const profile = db.doc(`/profiles/${user.uid}`)
  await profile.set({ auth: userAuth }, { merge: true })
}
