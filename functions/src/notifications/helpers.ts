import { Timestamp } from "firebase-admin/firestore"
import { Frequency } from "../auth/types"
import { startOfDay } from "date-fns"

// TODO - Unit tests
export const getNextDigestAt = (notificationFrequency: Frequency) => {
  const now = startOfDay(new Date())
  let nextDigestAt = null
  switch (notificationFrequency) {
    case "Weekly":
      const weekAhead = new Date(now)
      weekAhead.setDate(weekAhead.getDate() + 7)
      nextDigestAt = Timestamp.fromDate(weekAhead)
      break
    case "Monthly":
      const monthAhead = new Date(now)
      monthAhead.setMonth(monthAhead.getMonth() + 1)
      nextDigestAt = Timestamp.fromDate(monthAhead)
      break
    case "None":
      nextDigestAt = null
      break
    default:
      console.error(`Unknown notification frequency: ${notificationFrequency}`)
      break
  }

  return nextDigestAt
}

export const getNotificationStartDate = (
  notificationFrequency: Frequency,
  now: Timestamp
) => {
  switch (notificationFrequency) {
    case "Weekly":
      const weekAgo = new Date(now.toDate())
      weekAgo.setDate(weekAgo.getDate() - 7)
      return Timestamp.fromDate(weekAgo)
    case "Monthly":
      const monthAgo = new Date(now.toDate())
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return Timestamp.fromDate(monthAgo)
    // We can safely fallthrough here because if the user has no notification frequency set,
    // we won't even send a notification
    default:
      return now
  }
}
