import React, { useState } from "react"
import CardBootstrap from "react-bootstrap/Card"
import styles from "./Card.module.css"
import { CardListItems } from "./CardListItem"
import { CardTitle } from "./CardTitle"
import { SeeMore } from "./SeeMore"
import { LabeledIcon } from "../shared"
import styled from "styled-components"
import { Col, Container, Row } from "../bootstrap"

interface CardItem {
  billName: string
  billDescription: string
}

interface CardObject {
  id: number
  Name: string
  sponsorType: string
}

interface CardProps {
  header: string | undefined
  imgSrc?: string | undefined
  subheader?: string | undefined
  bodyText?: string | undefined
  timestamp?: string | undefined
  cardItems?: CardItem[] | undefined
  cardObjects?: CardObject[][] | undefined
  numOfSponsors?: number | undefined
}

export const Card = (CardProps: CardProps) => {
  const {
    header,
    imgSrc,
    subheader,
    bodyText,
    timestamp,
    cardItems,
    cardObjects,
    numOfSponsors
  } = CardProps
  const [cardItemsToDisplay, setCardItemsToDisplay] = useState<
    CardItem[] | undefined
  >(cardItems?.slice(0, 3))
  const [cardObjectsToDisplay, setCardObjectsToDisplay] = useState<
    CardObject[][] | undefined
  >(cardObjects?.slice(0, 1))

  const handleSeeMoreClick = (event: string): void => {
    if (event === "SEE_MORE") {
      setCardItemsToDisplay(cardItems)
      return
    }
    setCardItemsToDisplay(cardItems?.slice(0, 3))
  }

  const handleSeeMoreObjects = (event: string): void => {
    if (event === "SEE_MORE") {
      setCardObjectsToDisplay(cardObjects)
      return
    }
    setCardObjectsToDisplay(cardObjects?.slice(0, 1))
  }

  return (
    <CardBootstrap className={styles.container}>
      <CardTitle
        header={header}
        subheader={subheader}
        timestamp={timestamp}
        imgSrc={imgSrc}
      />
      {cardItemsToDisplay?.length && (
        <CardListItems cardItems={cardItemsToDisplay} />
      )}
      {bodyText && (
        <CardBootstrap.Body>
          <CardBootstrap.Text className={styles.body}>
            {bodyText}
          </CardBootstrap.Text>
        </CardBootstrap.Body>
      )}
      {cardItems?.length && cardItems?.length > 3 && (
        <SeeMore onClick={handleSeeMoreClick} />
      )}
      {cardObjectsToDisplay?.length && (
        <CardBootstrap.Body className="px-0">
          <CardBootstrap.Text className={styles.body}>
            <Container>
              {cardObjectsToDisplay.map((row, idx) => (
                <Row key={idx}>
                  {row.map((col, idxx) => {
                    return (
                      <Col key={idxx} xs={4} md={4} lg={4}>
                        <div className="p-5 mx-5">
                          <LabeledIcon
                            key={idxx}
                            idImage={`https://malegislature.gov/Legislators/Profile/170/${col.id}.jpg`}
                            mainText="Sponsor"
                            subText={
                              <a
                                href={`https://malegislature.gov/Legislators/Profile/${col.id}`}
                              >
                                {col.Name}
                              </a>
                            }
                          />
                        </div>
                      </Col>
                    )
                  })}
                </Row>
              ))}
            </Container>
          </CardBootstrap.Text>
          {numOfSponsors && numOfSponsors > 3 && (
            <div className="px-0" style={{ height: "50px" }}>
              <hr className="px-0" />
              <SeeMore
                onClick={handleSeeMoreObjects}
                numberOfItems={numOfSponsors}
                typeOfItems="Sponsors"
              />
            </div>
          )}
        </CardBootstrap.Body>
      )}
    </CardBootstrap>
  )
}
