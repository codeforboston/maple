import React, { useEffect, useState } from "react"
import { Container, Carousel, Spinner } from "react-bootstrap"
import { Col, Image, Row } from "../bootstrap"
import styles from "./HearingsScheduled.module.css"
import { useUpcomingEvents } from "../db/events"
import CarouselLeft from "../../public/carousel-left.png"
import CarouselRight from "../../public/carousel-right.png"

/*
Return an object in format below: 
{ day: "Thursday", month: "Aug", date: "18", time: "11:00 AM" }
*/
export const formatDate = (
  dateString: string
): { day: string; month: string; year: string; date: string; time: string } => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ]
  const date = new Date(dateString)
  const day = daysOfWeek[new Date(date).getDay()]
  const month = months[date.getMonth()]
  const num = date.getDate().toString()
  const year = date.getFullYear().toString()

  const [hourString, minute] = dateString.split("T")[1].split(":")
  let hour = parseInt(hourString)
  const meridian = hour < 12 ? "PM" : "AM"
  if (hour > 12) hour -= 12
  const formattedTime = `${hour.toString()}:${minute} ${meridian}`

  return { day, month, year, date: num, time: formattedTime }
}

type EventData = {
  index: number
  type: string
  name: string
  id: number
  location: string
  fullDate: Date
  year: string
  month: string
  date: string
  day: string
  time: string
}

/*
Currently event types handled: sessions, hearings.
  Event type of specialEvent (and any incorrect value) are ignored.
  SpecialEvent type contains only EventId, EventDate, and StartTime
  It is missing name and location which are used on the event cards.
*/
export const EventCard = ({
  index,
  type,
  name,
  id,
  location,
  fullDate,
  year,
  month,
  date,
  day,
  time
}: EventData) => {
  const hearingBaseURL = "https://malegislature.gov/Events/Hearings/Detail/"
  const sessionBaseURL = "https://malegislature.gov/Events/Sessions/Detail/"

  /* If entry exceeds maxLength shorten entry to fit in 2 lines with an ellipsis */
  const truncateEntry = (entry: string): string => {
    const maxLength = 38

    if (entry.length > maxLength) return entry.slice(0, maxLength) + "..."
    return entry
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.month}>{month}</p>
          <p className={styles.date}>{date}</p>
        </div>
        <div className={styles.day}>{day}</div>
      </div>

      <div className={styles.cardBody}>
        <div>
          <p className={styles.time}>{time}</p>
        </div>
        <div>
          <p className={styles.name}>
            {type === "hearings" ? (
              <a title="testing" href={`${hearingBaseURL}${id}`}>
                {truncateEntry(name)}
              </a>
            ) : (
              <a href={`${sessionBaseURL}${id}`}>{truncateEntry(name)}</a>
            )}
          </p>
          <p className={styles.location}>{truncateEntry(location)}</p>
        </div>
      </div>
    </div>
  )
}

const numberToFullMonth = (month: number): string => {
  switch (month) {
    case 0:
      return "January"
    case 1:
      return "February"
    case 2:
      return "March"
    case 3:
      return "April"
    case 4:
      return "May"
    case 5:
      return "June"
    case 6:
      return "July"
    case 7:
      return "August"
    case 8:
      return "September"
    case 9:
      return "October"
    case 10:
      return "November"
    case 11:
      return "December"
    default:
      return "August"
  }
}
/******************************************************************************************************* */

/** Component with interactive calendar of upcoming hearings and sessions */

export const HearingsScheduled = () => {
  const [monthIndex, setMonthIndex] = useState(0)

  const handleSelect = (
    selectedIndex: number,
    e: Record<string, unknown> | null
  ): void => {
    setMonthIndex(selectedIndex)
  }

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

  const thisMonthsEvents = eventList.filter(e => {
    return e.index === monthIndex
  })

  return (
    <Container fluid>
      <Row className="mt-5 align-content-center">
        <Col>
          <h1 className={`${styles.heading}`}>Hearings Scheduled</h1>
        </Col>
      </Row>
      <Row className="">
        <Col sm={5}>
          <Image
            className={`ml-5 ${styles.podium}`}
            src="speaker-podium.png"
            alt="speaker at podium"
          />
        </Col>
        <Col sm={7}>
          <section className={`${styles.carousel}`}>
            <Carousel
              variant="dark"
              interval={null}
              indicators={false}
              slide={false}
              wrap={false}
              activeIndex={monthIndex}
              onSelect={handleSelect}
              // bsPrefix={styles.carousel}
            >
              {monthsList?.map(month => {
                return (
                  <Carousel.Item key={month}>
                    <h1 className="text-center">{month}</h1>
                  </Carousel.Item>
                )
              })}
            </Carousel>
          </section>

          {events ? (
            <>
              {thisMonthsEvents.length ? (
                <section className={styles.eventSection}>
                  {thisMonthsEvents?.map(e => {
                    return (
                      <EventCard
                        key={e.id}
                        index={e.index}
                        type={e.type}
                        name={e.name}
                        id={e.id}
                        location={e.location}
                        fullDate={e.fullDate}
                        year={e.year}
                        month={e.month}
                        date={e.date}
                        day={e.day}
                        time={e.time}
                      />
                    )
                  })}
                </section>
              ) : (
                <section className={styles.noEvents}>
                  <h2>No Scheduled Events</h2>
                </section>
              )}
            </>
          ) : (
            <div className={styles.loading}>
              <Spinner animation="border" className="mx-auto" />
            </div>
          )}
        </Col>
      </Row>
    </Container>
  )
}
