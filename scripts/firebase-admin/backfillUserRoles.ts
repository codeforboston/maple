import { UserRecord } from "firebase-admin/auth"
import { setRole } from "functions/src/auth"
import { Auth } from "functions/src/types"
import { Script } from "./types"

/** backfill the authorRole field on all publishedTestimony documents
 * and set user role claims to "user" if they don't have claims configured.
 */
export const script: Script = async ({ db, auth }) => {
  // For each user, set the role claim to "user" if they don't have a role claim.
  const allUsers = await listAllUsers(auth),
    usersById = new Map(allUsers.map(u => [u.uid, u]))
  let userUpdateCount = 0
  console.log(`Configuring ${allUsers.length} users roles`)
  for (const user of allUsers) {
    const existingRole = user.customClaims?.role
    if (!existingRole) {
      userUpdateCount++
      await setRole({ uid: user.uid, auth, role: "user", db })
    }
  }
  console.log(`Updated ${userUpdateCount} users`)

  const writer = db.bulkWriter()
  const allTestimony = await db
    .collectionGroup("publishedTestimony")
    .select("authorUid", "authorRole")
    .get()

  // For each testimony, set the authorRole field to the user's role claim.
  console.log(`Checking ${allTestimony.size} testimony documents`)
  let testimonyUpdateCount = 0
  for (const testimony of allTestimony.docs) {
    const { authorUid, authorRole: existingRole } = testimony.data()
    const role = usersById.get(authorUid)?.customClaims?.role || "user"

    // If the authorRole field is already set, skip this document.
    if (existingRole !== role) {
      testimonyUpdateCount++
      void writer.update(testimony.ref, { authorRole: role })
    }
  }

  await writer.close()
  console.log(`Updated ${testimonyUpdateCount} documents`)
}

/**  Returns a list of all users in firestore. */
const listAllUsers = async (auth: Auth) => {
  const users: UserRecord[] = []
  let nextPageToken: string | undefined
  do {
    const result = await auth.listUsers(1000, nextPageToken)
    users.push(...result.users)
  } while (nextPageToken)
  return users
}
