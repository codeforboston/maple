import { Script } from "./types"

const BATCH_SIZE = 100

export const script: Script = async ({ db }) => {
  console.log("Setting notificationFrequency to Weekly for all users")
  let numProfilesUpdated = 0
  let numProfilesSkipped = 0

  let profiles = await db.collection("profiles").limit(BATCH_SIZE).get()

  do {
    const lastDoc = profiles.docs[profiles.docs.length - 1]

    const batch = db.batch()
    for (const doc of profiles.docs) {
      if (doc.data().notificationFrequency === "None") {
        // Preserve "None" settings (since these may be intentional opt-outs)
        numProfilesSkipped++
        console.log(
          `Skipping user ${doc.id} with notification frequency set to None.`
        )
      } else {
        numProfilesUpdated++
        batch.update(doc.ref, { notificationFrequency: "Weekly" })
        console.log(`Updating user ${doc.id} notification frequency to Weekly.`)
      }
    }

    numProfilesUpdated += profiles.docs.length
    await batch.commit()

    profiles = await db
      .collection("profiles")
      .startAfter(lastDoc)
      .limit(BATCH_SIZE)
      .get()
  } while (profiles.docs.length > 0)

  console.log(
    `Finished updating notification frequency. Updated ${numProfilesUpdated} profiles, skipped ${numProfilesSkipped} profiles.`
  )
}
