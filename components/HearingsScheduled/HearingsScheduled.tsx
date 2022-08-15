import React, { useState } from "react"
import { Container, Carousel } from "react-bootstrap"
import { Button, Col, Image, Row } from "../bootstrap"
import styles from "./HearingsScheduled.module.css"

export const HearingsScheduled = () => {
  // const hearings = [
  //   {
  //     date: new Date(),
  //     place1: "Senate Session",
  //     place2: "Senate Chamber"
  //   },
  //   {
  //     date: new Date(),
  //     place1: "Senate Session",
  //     place2: "Senate Chamber"
  //   },
  //   {
  //     date: new Date(),
  //     place1: "Senate Session",
  //     place2: "Senate Chamber"
  //   },
  //   {
  //     date: new Date(),
  //     place1: "Senate Session",
  //     place2: "Senate Chamber"
  //   }
  // ]

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
                bsPrefix={styles.carousel}
              >
                <Carousel.Item>
                  <h2 className="text-center">August 2022</h2>
                </Carousel.Item>
                <Carousel.Item>
                  <h2 className="text-center">September 2022</h2>
                </Carousel.Item>
                <Carousel.Item>
                  <h2 className="text-center">October 2022</h2>
                </Carousel.Item>
              </Carousel>
            </section>
          </Col>
        </Row>
      </Container>
    </>
  )
}
