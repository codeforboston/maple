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

  const profile = db.doc(`/profiles/${user.uid}`)
  const profileData = await profile.get().then(s => s.data())
  const currentProfile = Profile.Or(Undefined).check(profileData)
  const profile = db.doc(`/profiles/${user.uid}`)
  const profileData = await profile.get().then(s => s.data())
  const currentProfile = Profile.Or(Undefined).check(profileData)
  const profileUpdate: Partial<Profile> = {
    role,
    public: isPublic(currentProfile, role)
  }
  await profile.set(profileUpdate, { merge: true })

  await updateTestimony(db, {
    uid: user.uid,
    displayName: currentProfile?.displayName ?? "Anonymous",
    role
  })
}

/**
 * Update all the user's published testimony with the new role value
 */
const updateTestimony = async (
  db: Database,
  u: { uid: string; displayName: string; role: Role }
) => {
  const writer = db.bulkWriter()
  const publishedTestimony = await db
    .collection(`/users/${u.uid}/publishedTestimony`)
    .select("authorUid", "authorDisplayName", "authorRole")
    .get()

  // For each testimony, set the authorRole field to the user's role claim.
  for (const testimony of publishedTestimony.docs) {
    const { authorDisplayName: existingName, authorRole: existingRole } =
      testimony.data()

    // If the authorRole field is already set, skip this document.
    if (existingRole !== u.role || existingName !== u.displayName) {
      const update = { authorRole: u.role, authorDisplayName: u.displayName }
      void writer.update(testimony.ref, update)
    }
  }

  await writer.close()
}

const isPublic = (profile: Profile | undefined, role: Role) => {
  switch (role) {
    case "pendingUpgrade":
    case "admin":
      return false
    case "legislator":
    case "pendingUpgrade":
      return false
    case "organization":
      return true
    case "user":
      return typeof profile?.public === "boolean" ? profile.public : false
  }
}
