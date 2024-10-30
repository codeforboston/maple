import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { Timestamp } from "../firebase"
import { onDocumentCreated } from "firebase-functions/v2/firestore"

// Get a reference to the Firestore database
const db = admin.firestore()

// Function to trigger whenever a document is created in activeTopicSubscriptions
export const updateNextDigestAt = onDocumentCreated(
  "users/{userId}/activeTopicSubscriptions/{subscriptionId}",
  async event => {
    const { userId } = event.params

    // Get the user's notificationFrequency
    const userDoc = await db.collection("users").doc(userId).get()

    if (!userDoc.exists) {
      console.error(`User document for user ${userId} does not exist`)
      return
    }

    const user = userDoc.data()

    if (user) {
      const { notificationFrequency } = user

      // Calculate nextDigestAt based on notificationFrequency
      const now = Timestamp.fromDate(new Date())
      let nextDigestAt
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

      // Add nextDigestAt to the activeTopicSubscriptions document
      return event.data?.ref.update({ nextDigestAt })
    } else {
      throw new Error(`User document for user ${userId} does not exist`)
    }
  }
)
