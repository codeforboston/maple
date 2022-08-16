import React, { useState } from "react"
import { Container, Carousel } from "react-bootstrap"
import { Button, Col, Image, Row, Card } from "../bootstrap"
import styles from "./HearingsScheduled.module.css"
import { useUpcomingEvents } from "../db/events"
import { Event, Session, Hearing } from "../../functions/src/events/types"

export const formatDate = (
  dateString: string
): { day: string; month: string; date: string; time: string } => {
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

  const [hourString, minute] = dateString.split("T")[1].split(":")
  let hour = parseInt(hourString)
  const meridian = hour < 12 ? "PM" : "AM"
  if (hour > 12) hour -= 12
  const formattedTime = `${hour.toString()}:${minute} ${meridian}`

  return { day, month, date: num, time: formattedTime }
}

type EventData = {
  type: string
  name: string
  id: number
  location: string
  fullDate: Date
  month: string
  date: string
  day: string
  time: string
}

const EventCard = ({
  type,
  name,
  id,
  location,
  fullDate,
  month,
  date,
  day,
  time
}: EventData) => {
  const hearingBaseURL = "https://malegislature.gov/Events/Hearings/Detail/"
  const sessionBaseURL = "https://malegislature.gov/Events/Sessions/Detail/"
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
              <a href={`${hearingBaseURL}${id}`}>{name}</a>
            ) : (
              <a href={`${sessionBaseURL}${id}`}>{name}</a>
            )}
          </p>
          <p className={styles.location}>{location}</p>
        </div>
      </div>
    </div>
  )
}

export const HearingsScheduled = () => {
  const Leaf = () => {
    return (
      <div className={styles.container}>
        <Image className={styles.leaf} fluid src="leaf-asset.png" alt="leaf" />
      </div>
    )
  }

  const [index, setIndex] = useState(0)

  const handleSelect = (
    selectedIndex: number,
    e: Record<string, unknown> | null
  ): void => {
    setIndex(selectedIndex)
  }

  let events = useUpcomingEvents()

  const eventList: EventData[] = []
  if (events) {
    for (let e of events) {
      const date = formatDate(e.content.EventDate)
      if (e.type === "session") {
        eventList.push({
          type: e.type,
          name: e.content.Name,
          id: e.content.EventId,
          location: e.content.LocationName,
          fullDate: new Date(e.content.EventDate),
          month: date.month,
          date: date.date,
          day: date.day,
          time: date.time
        })
      } else if (e.type === "hearing") {
        eventList.push({
          type: e.type,
          name: e.content.Name,
          id: e.content.EventId,
          location: e.content.Location.LocationName,
          fullDate: new Date(e.content.EventDate),
          month: date.month,
          date: date.date,
          day: date.day,
          time: date.time
        })
      }
    }
  }
  eventList.map(e => {
    console.log(
      `Event: ${e.name} ${e.id} ${e.location} ${e.month} ${e.date} ${e.day}`
    )
  })

  return (
    <>
      <Leaf />
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
                activeIndex={index}
                onSelect={handleSelect}
                // bsPrefix={styles.carousel}
              >
                <Carousel.Item>
                  <h1 className="text-center">August 2022</h1>
                </Carousel.Item>
                <Carousel.Item>
                  <h1 className="text-center">September 2022</h1>
                </Carousel.Item>
                <Carousel.Item>
                  <h1 className="text-center">October 2022</h1>
                </Carousel.Item>
              </Carousel>
            </section>

            <section className={styles.eventSection}>
              {eventList?.map(e => {
                return (
                  <EventCard
                    key={e.id}
                    type={e.type}
                    name={e.name}
                    id={e.id}
                    location={e.location}
                    fullDate={e.fullDate}
                    month={e.month}
                    date={e.date}
                    day={e.day}
                    time={e.time}
                  />
                )
              })}
            </section>
          </Col>
        </Row>
      </Container>
    </>
  )
}
