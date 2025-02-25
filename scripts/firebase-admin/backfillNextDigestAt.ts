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
import { Boolean, Record } from "runtypes"

// todo - actually move nextDigestAt into profiles
// - no reason not to do it now, we have the backfill and the rules
//  don't protect any collection
// I'll need to fix the rules so that writes to the `profiles::nextDigestAt` field can only be made by admins
//  - e.g. this script, the deliverNotifcaitons script, or theupdateNotifiaciotn script
const Args = Record({
  dryRun: Boolean
})

export const script: Script = async ({ db, auth, args }) => {
  const profilesSnapshot = await db.collection("profiles").get()

  const updatePromises = profilesSnapshot.docs.map(async profileDoc => {
    const profile = profileDoc.data() as Profile

    if (profile.notificationFrequency) {
      const nextDigestAt = getNextDigestAt(profile.notificationFrequency)

      if (!args.dryRun) {
        await profileDoc.ref.update({ nextDigestAt })
      }
      console.log(
        `Updated nextDigestAt for ${profileDoc.id} to ${nextDigestAt}`
      )
    } else {
      console.log(
        `Profile ${profileDoc.id} does not have notificationFrequency - skipping`
      )
    }
  })

  await Promise.all(updatePromises)
  console.log("Backfill complete")
}
