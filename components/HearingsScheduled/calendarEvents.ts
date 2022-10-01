import { useUpcomingEvents } from "../db/events"
import { EventData } from "./HearingsScheduled"
import { formatDate, numberToFullMonth } from "./dateUtils"

/* This hook is expecting useUpcomingEvents to return a list sorted by date. 
    The field eventList.fullDate exists as a Date type in case sorting needs to be done
    here in the future.

    Only events from the current month forward are returned
*/
export const useCalendarEvents = () => {
  const events = useUpcomingEvents()

  const eventList: EventData[] = []
  let latestDate = new Date()
  const indexOffset = new Date().getMonth()

  if (events) {
    for (let e of events) {
      const currentDate = new Date(e.content.EventDate)

      if (currentDate > latestDate) latestDate = currentDate

      const date = formatDate(e.content.EventDate)
      if (e.type === "session") {
        eventList.push({
          index: currentDate.getMonth() - indexOffset,
          type: e.type,
          name: e.content.Name,
          id: e.content.EventId,
          location: e.content.LocationName,
          fullDate: currentDate,
          year: date.year,
          month: date.month,
          date: date.date,
          day: date.day,
          time: date.time
        })
      } else if (e.type === "hearing") {
        eventList.push({
          index: currentDate.getMonth() - indexOffset,
          type: e.type,
          name: e.content.Name,
          id: e.content.EventId,
          location: e.content.Location.LocationName,
          fullDate: currentDate,
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
  let currentDate = new Date()
  const monthsList = []
  while (currentDate.getMonth() <= latestDate.getMonth()) {
    monthsList.push(
      `${numberToFullMonth(currentDate.getMonth())} ${currentDate
        .getFullYear()
        .toString()}`
    )
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  const loading = events ? false : true

  return { loading, eventList, monthsList }
}
