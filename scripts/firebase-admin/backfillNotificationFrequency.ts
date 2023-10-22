import { Script } from "./types"
import { listAllUsers } from "./list-all-users"

export const script: Script = async ({ db, auth }) => {
  const allUsers = await listAllUsers(auth)
  const usersById = new Map(allUsers.map(u => [u.uid, u]))

  console.log(`Configuring ${allUsers.length} users notification frequency`)

  for (const user of allUsers) {
    // Get user document from Firestore
    const userDoc = db.collection("users").doc(user.uid)
    const doc = await userDoc.get()

    // If the user document exists in Firestore
    if (doc.exists) {
      const userData = doc.data()

      // If userData is not undefined and notificationFrequency is not set already
      if (userData && !userData.notificationFrequency) {
        // Remove second condition to run on all users, not just those without a notificationFrequency field set
        // Update the user document in Firestore
        await userDoc.update({
          notificationFrequency: "None"
        })
        console.log(`Updated user ${user.uid} notification frequency to None.`)
      }
    } else {
      console.log(`No document for user ${user.uid}`)
    }
  }
}
