/*
    This script is intended to backfill the `nextDigestAt` field
    into the `profiles` collection. This field is used to determine
    when the next notifications digest email should be sent to a user
    based on their set `notificationFrequency`.

    This script can be safely removed after the `nextDigestAt` field
    has been added to the profiles collection.
*/

import { getNextDigestAt } from "../../functions/src/notifications/helpers"
import { Profile } from "../../components/db/profile/types"
import { Script } from "./types"
import { Boolean, Optional, Record } from "runtypes"

const Args = Record({
  dryRun: Optional(Boolean)
})

export const script: Script = async ({ db, args }) => {
  const { dryRun } = Args.check(args)

  let numProfiles = 0,
    numMissingFrequency = 0,
    numWithNextDigestAt = 0,
    numNeedingNextDigestAt = 0

  // There are only ~500 profiles at the time of writing
  // so the bulkWriter is unnecessary
  const profilesSnapshot = await db.collection("profiles").get()
  console.log(profilesSnapshot.docs.length, "profiles found")

  const updatePromises = profilesSnapshot.docs.map(async profileDoc => {
    const profile = profileDoc.data() as Profile
    numProfiles++

    if (profile.notificationFrequency) {
      const hasNextDigestAt = !!profile.nextDigestAt
      if (hasNextDigestAt) {
        numWithNextDigestAt++
      } else {
        numNeedingNextDigestAt++
      }

      const nextDigestAt = getNextDigestAt(profile.notificationFrequency)

      if (!dryRun) {
        await profileDoc.ref.update({ nextDigestAt })
      }
      console.log(
        `Updated nextDigestAt for ${profileDoc.id} to ${nextDigestAt?.toDate()}`
      )
    } else {
      numMissingFrequency++
      console.log(
        `Profile ${profileDoc.id} does not have notificationFrequency - skipping`
      )
    }
  })

  await Promise.all(updatePromises)

  console.log("Num profiles:", numProfiles)
  console.log("Num missing frequency:", numMissingFrequency)
  console.log("Num with nextDigestAt:", numWithNextDigestAt)
  console.log("Num needing nextDigestAt:", numNeedingNextDigestAt)
  console.log("Backfill complete")
}
