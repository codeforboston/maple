import { DateTime } from "luxon"

import { TabBlock } from "../LegislatorComponents"

import { useUpcomingEvents } from "components/db/events"
import { EventData } from "components/HearingsScheduled"
import { formatDate } from "components/HearingsScheduled/dateUtils"

export function UpcomingHearings({ committeeList }: { committeeList: any[] }) {
  const events = useUpcomingEvents()
  const thisMonth = DateTime.now().startOf("month")
  const eventList: EventData[] = []
  let latestDate = DateTime.now()

  if (events) {
    for (let e of events) {
      const eventDate = DateTime.fromISO(e.content.EventDate)

      if (eventDate > latestDate) latestDate = eventDate

      const index = Math.floor(eventDate.diff(thisMonth, "months").months)
      const date = formatDate(e.content.EventDate)
      if (e.type === "hearing") {
        eventList.push({
          index,
          type: e.type,
          name: e.content.Name ?? "Hearing",
          code: e.content.HearingHost.CommitteeCode,
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

  const LegislatorCommitteCodes = committeeList.map(code => code.CommitteeCode)

  let legislatorEvents: any[] = []

  if (events) {
    eventList.forEach(event => {
      if (LegislatorCommitteCodes.includes(event.code)) {
        legislatorEvents.push(event)
      }
    })
  }

  console.log("legislatorEvents", legislatorEvents)

  return <TabBlock>- Upcoming Hearings</TabBlock>
}
