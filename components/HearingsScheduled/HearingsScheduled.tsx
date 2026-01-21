import React, { useState } from "react"
import { Container, Carousel, Spinner } from "react-bootstrap"
import styled from "styled-components"
import { Col, Row } from "../bootstrap"
import { useCalendarEvents } from "./calendarEvents"
import { useTranslation } from "next-i18next"

export type EventData = {
  index: number
  type: "hearing" | "session"
  name: string
  id: number
  location?: string
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

    if (!!entry && entry.length > maxLength)
      return entry.slice(0, maxLength) + "..."
    return entry
  }

  return (
    <EventCardContainer>
      <EventCardHeader>
        <div className={`d-grid align-items-start`}>
          <div className={`h6 m-0 p-0`}>{month}</div>
          <div className={`h4 m-0 p-0`}>{date}</div>
        </div>
        <div className={`h4 mb-0 `}>{day}</div>
      </EventCardHeader>

      <div className={`container pt-3 px-4`}>
        <div className="row">
          <div className="col-sm-4">
            <p>{time}</p>
          </div>
          <div className="col-sm-8">
            <p className={`lh-sm mb-2 ms-2 text-secondary`}>
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
            <p className={`lh-sm mb-3 ms-2 text-secondary`}>
              {truncateEntry(location ?? "")}
            </p>
          </div>
        </div>
      </div>
    </EventCardContainer>
  )
}

const EventSection = styled.section`
  min-width: fit-content;
  max-width: 43rem;
  margin-bottom: 2em;
`

const HearingImage = styled.img`
  margin-bottom: 10.3em;
  width: 20rem;

  @media (max-width: 48em) {
    margin-bottom: 4.5em;
  }

  @media (max-width: 23.44em) {
    width: 12.94rem;
  }
`

const CarouselControlNextIcon = styled.span`
  width: 2.3125rem;
  height: 2.3125rem;
  background-image: url("/carousel-right.png");
  background-repeat: no-repeat;
`

const CarouselControlPrevIcon = styled.span`
  width: 2.3125rem;
  height: 2.3125rem;
  background-image: url("/carousel-left.png");
  background-repeat: no-repeat;
`

export const HearingsScheduled = () => {
  const [monthIndex, setMonthIndex] = useState(0)
  const { t } = useTranslation("homepage")

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
          <div className={`h1 mb-5 text-center text-secondary`}>
            {t("hearingsScheduled.title")}
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={{ order: 1 }} md={{ span: 5, order: 0 }}>
          <HearingImage
            className={`d-block mx-auto`}
            src="/speaker-podium.svg"
            alt=""
          />
        </Col>
        <Col md={7}>
          <section className={`mb-5`}>
            <Carousel
              variant="dark"
              interval={null}
              indicators={false}
              slide={false}
              wrap={false}
              activeIndex={monthIndex}
              onSelect={handleSelect}
              prevIcon={<CarouselControlPrevIcon aria-hidden="true" />}
              nextIcon={<CarouselControlNextIcon aria-hidden="true" />}
            >
              {monthsList?.map(month => {
                return (
                  <Carousel.Item key={month}>
                    <div className="h1 text-center">{month}</div>
                  </Carousel.Item>
                )
              })}
            </Carousel>
          </section>

          {loading ? (
            <div className={`d-grid`}>
              <Spinner animation="border" className="mx-auto" />
            </div>
          ) : (
            <>
              {thisMonthsEvents.length ? (
                <EventSection>
                  <Container>
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
                </EventSection>
              ) : (
                <section className={`text-center text-secondary`}>
                  <h2>{t("hearingsScheduled.noEvents")}</h2>
                </section>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  )
}
