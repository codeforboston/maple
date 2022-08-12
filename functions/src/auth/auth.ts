import { UserRecord } from "firebase-admin/lib/auth/user-record"
import { Undefined } from "runtypes"
import { Profile } from "../profile/types"
import { Auth, Database } from "../types"
import { Claim, Role } from "./types"

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

  const claim: Claim = { role }
  await auth.setCustomUserClaims(user.uid, claim)

  const profileDoc = db.doc(`/profiles/${user.uid}`)
  const currentProfile = Profile.Or(Undefined).check(
    (await profileDoc.get()).data()
  )
  const profileUpdate: Partial<Profile> = {
    role,
    public: isPublic(currentProfile, role)
  }
  await profileDoc.set(profileUpdate, { merge: true })
}

const isPublic = (profile: Profile | undefined, role: Role) => {
  switch (role) {
    case "admin":
      return false
    case "legislator":
    case "organization":
      return true
    case "user":
      return typeof profile?.public === "boolean" ? profile.public : false
  }
}
