import React, { useState } from "react"
import { Container, Carousel, Spinner } from "react-bootstrap"
import { Col, Image, Row } from "../bootstrap"
import styles from "./HearingsScheduled.module.css"
import { useUpcomingEvents } from "../db/events"
import { formatDate, numberToFullMonth } from "./dateUtils"

export type EventData = {
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
  It is missing name and location which are used on the event cards:
  A decision needs to be made as what info would go on cards
  and determine what the base URL is.
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

/** Component with interactive calendar of upcoming hearings and sessions */
/** TBD import carousel-left and carousel right icons for the carousel component */
export const HearingsScheduled = () => {
  const [monthIndex, setMonthIndex] = useState(0)

  const handleSelect = (
    selectedIndex: number,
    e: Record<string, unknown> | null
  ): void => {
    setMonthIndex(selectedIndex)
  }

  /* Currently this component is expecting useUpcomingEvents to return a sorted list 
    The field eventList.fullDate exists as a date type in case sorting needs to be done
    here in the future.
   */
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
                  <Container>
                    <Row className="gx-5 justify-content-center">
                      {thisMonthsEvents?.map(e => {
                        return (
                          <Col xxl={6} key={e.id}>
                            <EventCard
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
                          </Col>
                        )
                      })}
                    </Row>
                  </Container>
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
