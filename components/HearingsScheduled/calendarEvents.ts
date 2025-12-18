import { DateTime } from "luxon"
import { useUpcomingEvents } from "../db/events"
import { formatDate, numberToFullMonth } from "./dateUtils"
import { EventData } from "./HearingsScheduled"
/* This hook is expecting useUpcomingEvents to return a list sorted by date. 
    The field eventList.fullDate exists as a Date type in case sorting needs to be done
    here in the future.

    Only events from the current month forward are returned
*/
export const useCalendarEvents = () => {
  const events = useUpcomingEvents()

  const thisMonth = DateTime.now().startOf("month")
  const eventList: EventData[] = []
  let latestDate = DateTime.now()
  const indexOffset = new Date().getMonth()

  if (events) {
    for (let e of events) {
      const eventDate = DateTime.fromISO(e.content.EventDate)

      if (eventDate > latestDate) latestDate = eventDate

      const index = Math.floor(eventDate.diff(thisMonth, "months").months)
      const date = formatDate(e.content.EventDate)
      if (e.type === "session") {
        eventList.push({
          index,
          type: e.type,
          name: e.content.Name,
          id: e.content.EventId,
          location: e.content.LocationName,
          fullDate: eventDate.toJSDate(),
          year: date.year,
          month: date.month,
          date: date.date,
          day: date.day,
          time: date.time
        })
      } else if (e.type === "hearing") {
        eventList.push({
          index,
          type: e.type,
          name: e.content.Name ?? "Hearing",
          id: e.content.EventId,
          location: e.content.Location?.LocationName ?? undefined,
          fullDate: eventDate.toJSDate(),
          year: date.year,
          month: date.month,
          date: date.date,
          day: date.day,
          time: date.time
        })
      }
    }
  }

  /* Create list of months to cycle through on calendar */
  let eventMonth = DateTime.now().startOf("month")
  const lastMonth = latestDate.startOf("month")
  const monthsList = []
  while (eventMonth <= lastMonth) {
    monthsList.push(
      `${numberToFullMonth(eventMonth.month - 1)} ${eventMonth.year}`
    )
    eventMonth = eventMonth.plus({ month: 1 })
  }

  const loading = events ? false : true

  return { loading, eventList, monthsList }
}
