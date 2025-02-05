import * as admin from "firebase-admin"
import { Timestamp } from "../firebase"
import { onDocumentWritten } from "firebase-functions/v2/firestore"

export const updateUserNotificationFrequency = onDocumentWritten(
  "profiles/{userId}",
  async event => {
    const userId = event.params.userId
    const docBeforeChange = event.data?.before.data()
    const docAfterChange = event.data?.after.data()

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

    // Update user document in the 'users' collection
    await admin.firestore().collection("users").doc(userId).set(
      {
        notificationFrequency: notificationFrequency
      },
      { merge: true }
    )

    // Update all documents in the 'activeTopicSubscriptions' sub-collection with the new nextDigestAt value
    const now = Timestamp.now()
    let nextDigestAt: admin.firestore.Timestamp | null
    switch (notificationFrequency) {
      case "Daily":
        nextDigestAt = Timestamp.fromMillis(
          now.toMillis() + 24 * 60 * 60 * 1000
        )
        break
      case "Weekly":
        nextDigestAt = Timestamp.fromMillis(
          now.toMillis() + 7 * 24 * 60 * 60 * 1000
        )
        break
      case "Monthly":
        const monthAhead = new Date(now.toDate())
        monthAhead.setMonth(monthAhead.getMonth() + 1)
        nextDigestAt = Timestamp.fromDate(monthAhead)
        break
      case "None":
        nextDigestAt = null
        break
      default:
        console.error(
          `Unknown notification frequency: ${notificationFrequency}`
        )
        break
    }

    const subscriptionDocs = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("activeTopicSubscriptions")
      .get()
    const batch = admin.firestore().batch()
    subscriptionDocs.docs.forEach((doc: { ref: any }) => {
      batch.update(doc.ref, { nextDigestAt: nextDigestAt })
    })

    await batch.commit()

    return null
  }
)
