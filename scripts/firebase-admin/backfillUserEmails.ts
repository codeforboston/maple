import { UserRecord } from "firebase-admin/auth"
import { Auth } from "functions/src/types"
import { Script } from "./types"
import { listAllUsers } from "./list-all-users"

/** Backfill the email field on user documents in Firestore.
 * If the email does not exist, set it.
 */
export const script: Script = async ({ db, auth }) => {
  const allUsers = await listAllUsers(auth),
    usersById = new Map(allUsers.map(u => [u.uid, u]))

  console.log(`Configuring ${allUsers.length} users emails`)

  const writer = db.bulkWriter()

  for (const user of allUsers) {
    try {
      // Get the user's email
      const existingEmail = user.email

      // Check if the email exists, if not, throw an error
      if (!existingEmail) {
        throw new Error(`User ${user.uid} does not have an email.`)
      }

      // Get the user's document
      const userDoc = db.collection("users").doc(user.uid)
      const docData = (await userDoc.get()).data() || {}

      // If the email is not set in the user's document, set it.
      if (!docData.email) {
        console.log(`Updating email for user ${user.uid}`)
        writer.set(
          userDoc,
          { ...docData, email: existingEmail },
          { merge: true }
        )
      }
    } catch (error) {
      // Log the error and continue with the next user
      console.error(`Error updating email for user ${user.uid}: `, error)
    }
  }

  await writer.close()
  console.log(`Completed updating emails`)
}
