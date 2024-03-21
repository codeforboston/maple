import React, { useState } from "react"
import { Container, Carousel, Spinner } from "react-bootstrap"
import styled from "styled-components"
import { Col, Image, Row } from "../bootstrap"
import styles from "./HearingsScheduled.module.css"
import { useUpcomingEvents } from "../db/events"
import { formatDate, numberToFullMonth } from "./dateUtils"
import { useCalendarEvents } from "./calendarEvents"
import * as admin from "firebase-admin"
import { Timestamp } from "functions/src/firebase"

export type EventData = {
  index: number
  type: "hearing" | "session"
  name: string
  id: number
  location: string
  fullDate: Date // TODO: Could be a timestamp
  year: string
  month: string
  date: string
  day: string
  time: string
  relatedBills?: RelatedBill[]
  relatedOrgs?: RelatedOrg[]
}

// types for Bills and Orgs
export type RelatedBill = {
  id: string
  court: number
}

export type RelatedOrg = {
  id: string
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

  const EventCardContainer = styled.div`
    border: 2px var(--bs-blue) solid;
    width: 20rem; /* width: 269px; */
    margin-bottom: 2em;
    border-radius: 0.5rem;
    display: block;
    height: fit-content;
    @media (max-width: 87.5em) {
      .card {
        margin-left: 8.2em;
      }
    }
    @media (max-width: 31em) {
      .card {
        margin-left: 0em;
      }
    }
  `

  const EventCardHeader = styled.div`
    color: white;
    background: var(--bs-blue);
    padding-top: 0.25em;
    padding-left: 1em;
    height: 3.21em; /* 51.94px */
    border-radius: 0.3125em 0.3125em 0 0;
    display: grid;
    grid-template-columns: 35% 65%;
    align-items: center;
  `

  const EventDate = styled.h5`
    font-size: 1.5rem;
    line-height: 0;
    padding-bottom: 1em;
  `

  return (
    <EventCardContainer>
      <EventCardHeader>
        <div>
          <h6 className={`lh-1 pb-2`}>{month}</h6>
          <EventDate>{date}</EventDate>
        </div>
        <div className={styles.day}>{day}</div>
      </EventCardHeader>

      <div className={styles.cardBody}>
        <div>
          <p className={styles.time}>{time}</p>
        </div>
        <div>
          <p className={styles.name}>
            {type === "hearing" ? (
              <a
                href={`${hearingBaseURL}${id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {truncateEntry(name)}
              </a>
            ) : (
              <a
                href={`${sessionBaseURL}${id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {truncateEntry(name)}
              </a>
            )}
          </p>
          <p className={styles.location}>{truncateEntry(location)}</p>
        </div>
      </div>
    </EventCardContainer>
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
            src="/speaker-podium.svg"
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
                          <Col xxl={6} key={`${e.id}-${e.type}`}>
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
