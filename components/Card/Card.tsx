import React, { useState } from "react"
import CardBootstrap from "react-bootstrap/Card"
import styles from "./Card.module.css"
import { CardListItems } from "./CardListItem"
import { CardTitle } from "./CardTitle"
import { SeeMore } from "./SeeMore"

interface CardItem {
  billName: string
  billDescription: string
}

interface CardProps {
  header: string | undefined
  imgSrc?: string | undefined
  subheader?: string | undefined
  bodyText?: string | undefined
  timestamp?: string | undefined
  cardItems?: CardItem[] | undefined
}

export const Card = (CardProps: CardProps) => {
  const { header, imgSrc, subheader, bodyText, timestamp, cardItems } =
    CardProps
  const [cardItemsToDisplay, setCardItemsToDisplay] = useState<
    CardItem[] | undefined
  >(cardItems?.slice(0, 3))

  const handleSeeMoreClick = (event: string): void => {
    if (event === "SEE_MORE") {
      setCardItemsToDisplay(cardItems)
      return
    }
    setCardItemsToDisplay(cardItems?.slice(0, 3))
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
    </CardBootstrap>
  )
}
