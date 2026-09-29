import { onDocumentWritten } from "firebase-functions/v2/firestore"
import { db } from "../firebase"
import { getNextDigestAt } from "./helpers"

export const updateUserNotificationFrequency = onDocumentWritten(
  "profiles/{userId}",
  async event => {
    const change = event.data
    if (!change) return

    const userId = event.params.userId
    const docBeforeChange = change.before.data()
    const docAfterChange = change.after.data()

    const isAnUpdate =
      docBeforeChange &&
      docBeforeChange.notificationFrequency !==
        docAfterChange?.notificationFrequency

    const isACreation = docBeforeChange === undefined

    if (!isAnUpdate && !isACreation) {
      console.warn(
        `Not an update or creation for userId: ${userId}, function will return without changes.`
      )
      return null
    }

    const notificationFrequency = docAfterChange?.notificationFrequency

    // Check if notification frequency is undefined
    if (!notificationFrequency) {
      console.log(`Notification frequency for user ${userId} is undefined.`)
      return null
    }

    // Update the profile document to include the computed `nextDigestAt`
    await db
      .collection("profiles")
      .doc(userId)
      .set(
        {
          nextDigestAt: getNextDigestAt(notificationFrequency)
        },
        { merge: true }
      )

    return null
  }
)
