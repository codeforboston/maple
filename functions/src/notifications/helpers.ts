import { Timestamp } from "../firebase"
import { Frequency } from "../auth/types"
import { startOfDay, addDays, addMonths, setDay, setDate } from "date-fns"

export const getNextDigestAt = (notificationFrequency: Frequency) => {
  const now = startOfDay(new Date())
  let nextDigestAt = null
  switch (notificationFrequency) {
    case "Weekly":
      // Weekly notifications are sent on Tuesdays
      // - this should be the next available Tuesday
      const nextTuesday = setDay(now, 2, { weekStartsOn: 1 })
      nextDigestAt = Timestamp.fromDate(
        nextTuesday <= now ? addDays(nextTuesday, 7) : nextTuesday
      )
      break
    case "Monthly":
      // Monthly notifications are sent on the 1st of the month
      const nextMonthFirst = setDate(addMonths(now, 1), 1)
      nextDigestAt = Timestamp.fromDate(nextMonthFirst)
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

// TODO: Rewrite with date-fns for consistency
// TODO: Unit tests
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
