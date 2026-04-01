const functions = require("firebase-functions")
import * as admin from "firebase-admin"
import { getNextDigestAt } from "./helpers"
import { onDocumentWritten } from "firebase-functions/v2/firestore"

export const updateUserNotificationFrequency = functions.firestore
  .document("profiles/{userId}")
  .onWrite(
    async (
      change: { before: { data: () => any }; after: { data: () => any } },
      context: { params: { userId: any } }
    ) => {
      const userId = context.params.userId
      const docBeforeChange = change.before.data()
      const docAfterChange = change.after.data()

      const isAnUpdate =
        docBeforeChange &&
        docBeforeChange.notificationFrequency !==
          docAfterChange.notificationFrequency

      const isACreation = docBeforeChange === undefined

      if (!isAnUpdate && !isACreation) {
        console.warn(
          `Not an update or creation for userId: ${userId}, function will return without changes.`
        )
        return null
      }

      const notificationFrequency = docAfterChange.notificationFrequency

      // Check if notification frequency is undefined
      if (!notificationFrequency) {
        console.log(`Notification frequency for user ${userId} is undefined.`)
        return null
      }

      // Update the profile document to include the computed `nextDigestAt`
      await admin
        .firestore()
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

export const updateUserNotificationFrequencyv2 = onDocumentWritten(
  "profiles/{userId}",
  async event => {
    const userId = event.params.userId
    const docBeforeChange = event.data?.before?.data()
    const docAfterChange = event.data?.after?.data()

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

    if (!notificationFrequency) {
      console.log(`Notification frequency for user ${userId} is undefined.`)
      return null
    }

    await admin
      .firestore()
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
