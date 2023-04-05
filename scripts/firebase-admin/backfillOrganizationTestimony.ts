import { UserRecord } from "firebase-admin/auth"
import { setRole } from "functions/src/auth"
import { Auth } from "functions/src/types"
import { Script } from "./types"
import { listAllUsers } from "./list-all-users"

/** backfill the authorRole field on all publishedTestimony documents
 * and set user role claims to "user" if they don't have claims configured.
 */
export const script: Script = async ({ db, auth }) => {
  // For each user, set the role claim to "user" if they don't have a role claim.
  const allUsers = await listAllUsers(auth)
  let userUpdateCount = 0
  console.log(`Configuring ${allUsers.length} users roles`)
  for (const user of allUsers) {
    const existingRole = user.customClaims?.role
    if (existingRole === "pendingUpgrade") {
      userUpdateCount++
      await setRole({ uid: user.uid, auth, role: "organization", db })
    }
  }
  console.log(`Updated ${userUpdateCount} users`)
}
