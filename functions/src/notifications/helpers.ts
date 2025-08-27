import { Timestamp } from "../firebase"
import { Frequency } from "../auth/types"
import {
  startOfDay,
  addMonths,
  setDate,
  previousTuesday,
  nextTuesday,
  subMonths,
  addDays
} from "date-fns"

import { JSDOM } from "jsdom"

export const getNextDigestAt = (notificationFrequency: Frequency) => {
  const now = startOfDay(new Date())
  let nextDigestAt = null
  switch (notificationFrequency) {
    case "Weekly":
      nextDigestAt = Timestamp.fromDate(nextTuesday(now))
      break
    case "Monthly":
      // Monthly notifications are sent on the 1st of the month
      const nextMonthFirst = setDate(addMonths(now, 1), 1)
      nextDigestAt = Timestamp.fromDate(nextMonthFirst)
      break
    case "Daily":
      console.log("helpers.ts version XYZ")
      nextDigestAt = Timestamp.fromDate(addDays(now, 1))
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
      return Timestamp.fromDate(previousTuesday(now.toDate()))
    case "Monthly":
      const firstOfMonth = setDate(now.toDate(), 1)
      const previousFirstOfMonth = subMonths(firstOfMonth, 1)
      return Timestamp.fromDate(previousFirstOfMonth)
    case "Daily":
      return Timestamp.fromDate(addDays(now.toDate(), -1))
    // We can safely fallthrough here because if the user has no notification frequency set,
    // we won't even send a notification
    default:
      return now
  }
}

export const convertHtmlToText = (html: string) => {
  const dom = new JSDOM(html)
  return dom.window.document.body.textContent || "No content"
}
