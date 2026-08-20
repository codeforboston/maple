import { DateTime } from "luxon"
import { useTranslation } from "next-i18next"
import styled from "styled-components"

import { SidebarBlock, SidebarTitle } from "../LegislatorSidebar"

import { useUpcomingEvents } from "components/db/events"
import { EventData } from "components/HearingsScheduled"
import { formatDate } from "components/HearingsScheduled/dateUtils"

const EventBlock = styled.div`
  border-bottom: 1px solid #b8c0c9;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 2px;
  padding: 8px 0;
`

const EventDate = styled.div`
  color: #1a3185;
`

const EventTitle = styled.div`
  color: #212529;
  font-weight: 600;
  text-decoration: none;
`

const EventLocation = styled.div`
  color: #6c757d;
  margin-top: 1px;
`

export function UpcomingHearings({ committeeList }: { committeeList: any[] }) {
  const { t } = useTranslation("legislators")

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

  return (
    <SidebarBlock className="mb-2">
      <SidebarTitle className={`my-1`}>{t("upcomingHearings")}</SidebarTitle>
      {legislatorEvents ? (
        <>
          {legislatorEvents.slice(0, 3).map(e => (
            <EventBlock key={e.id}>
              <EventDate>
                {e.month} {e.date} {" · "} {e.time}
              </EventDate>
              <EventTitle>{e.name}</EventTitle>
              <EventLocation>{e.location}</EventLocation>
            </EventBlock>
          ))}
        </>
      ) : (
        <div>{t("noEvents")}</div>
      )}
    </SidebarBlock>
  )
}
