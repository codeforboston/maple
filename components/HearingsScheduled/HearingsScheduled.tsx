import React, { useState } from "react"
import { Container, Carousel, Spinner } from "react-bootstrap"
import { Col, Image, Row } from "../bootstrap"
import styles from "./HearingsScheduled.module.css"
import { useUpcomingEvents } from "../db/events"
import { formatDate, numberToFullMonth } from "./dateUtils"
import { useCalendarEvents } from "./calendarEvents"

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
Event types handled: sessions, hearings.
  Event type of specialEvent (and any incorrect value) are ignored.

  The SpecialEvent data type only contains EventId, EventDate, and StartTime
  It is missing name and location which are used on the event cards:
  A decision needs to be made as what info would go on cards and determine what the base URL is.
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

export const HearingsScheduled = () => {
  const [monthIndex, setMonthIndex] = useState(0)

  const handleSelect = (
    selectedIndex: number,
    e: Record<string, unknown> | null
  ): void => {
    setMonthIndex(selectedIndex)
  }

  const { loading, eventList, monthsList } = useCalendarEvents()

  /* List of events in current month displayed in carousel */
  const thisMonthsEvents = eventList.filter(e => {
    return e.index === monthIndex
  })

  return (
    <Container fluid>
      <Row className="mt-5">
        <Col>
          <h1 className={`${styles.heading}`}>Hearings Scheduled</h1>
        </Col>
      </Row>
      <Row>
        <Col xs={{ order: 1 }} md={{ span: 5, order: 0 }}>
          <Image
            className={`ml-5 ${styles.podium}`}
            src="speaker-podium.png"
            alt="speaker at podium"
          />
        </Col>
        <Col md={7}>
          <section className={`${styles.carousel}`}>
            <Carousel
              variant="dark"
              interval={null}
              indicators={false}
              slide={false}
              wrap={false}
              activeIndex={monthIndex}
              onSelect={handleSelect}
              prevIcon={
                <span
                  aria-hidden="true"
                  className={styles.carouselControlPrevIcon}
                />
              }
              nextIcon={
                <span
                  aria-hidden="true"
                  className={styles.carouselControlNextIcon}
                />
              }
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

          {loading ? (
            <div className={styles.loading}>
              <Spinner animation="border" className="mx-auto" />
            </div>
          ) : (
            <>
              {thisMonthsEvents.length ? (
                <section className={styles.eventSection}>
                  <Container className="">
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
          )}
        </Col>
      </Row>
    </Container>
  )
}
