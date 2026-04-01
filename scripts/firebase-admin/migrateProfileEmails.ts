import { FieldValue } from "functions/src/firebase"
import { Script } from "./types"

// Migrate emails from profiles to users collection and delete from profiles
export const script: Script = async ({ db, auth }) => {
  const profilesSnapshot = await db
    .collection("profiles")
    .where("email", ">", "")
    .get()
  let emailUpdateCount = 0

  console.log(`Migrating emails for ${profilesSnapshot.size} profiles`)

  const bulkWriter = db.bulkWriter()

  for (const profileDoc of profilesSnapshot.docs) {
    const profileData = profileDoc.data()
    const userId = profileDoc.id
    const email = profileData.email

    if (email) {
      const userRef = db.collection("users").doc(userId)
      const userDoc = await userRef.get()
      const userEmail = userDoc.exists ? userDoc.data()?.email : undefined

      if (userEmail) {
        if (userEmail !== email) {
          console.error(
            `Email mismatch for userId ${userId}: profile email "${email}", user email "${userEmail}"`
          )
        } else {
          // Email is the same, just delete from profile collection
          bulkWriter.update(profileDoc.ref, { email: FieldValue.delete() })
        }
      } else {
        // No email in user collection, set it
        bulkWriter.set(userRef, { email }, { merge: true })
        bulkWriter.update(profileDoc.ref, { email: FieldValue.delete() })
        emailUpdateCount++
      }
    }
  }

  await bulkWriter.close()

  console.log(`Updated emails for ${emailUpdateCount} users`)
}
