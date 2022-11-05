import React, { ReactElement, useState } from "react"
import CardBootstrap from "react-bootstrap/Card"
import styles from "./Card.module.css"
import { CardListItems, ListItem } from "./CardListItem"
import { CardTitle } from "./CardTitle"
import { SeeMore } from "./SeeMore"

interface CardItem {
  billName: string
  billDescription: string
}

interface CardProps {
  header?: string | undefined
  imgSrc?: string | undefined
  subheader?: string | undefined
  bodyText?: string | undefined | ReactElement
  timestamp?: string | undefined
  cardItems?: CardItem[] | undefined
  items?: ReactElement[]
  headerElement?: ReactElement
  initialRowCount?: number
}

export const Card = (CardProps: CardProps) => {
  const {
    header,
    imgSrc,
    subheader,
    bodyText,
    timestamp,
    cardItems,
    items,
    headerElement,
    initialRowCount = 3
  } = CardProps

  const headerContent = header ? (
    <CardTitle
      header={header}
      subheader={subheader}
      timestamp={timestamp}
      imgSrc={imgSrc}
    />
  ) : headerElement ? (
    headerElement
  ) : null

  const [showAll, setShowAll] = useState(false)

  const handleSeeMoreClick = (event: string): void => {
    if (event === "SEE_MORE") {
      setShowAll(true)
    } else {
      setShowAll(false)
    }
  }

  const allItems = cardItems
    ? cardItems?.map(({ billName, billDescription }) => (
        <ListItem
          key={billName}
          billName={billName}
          billDescription={billDescription}
        />
      ))
    : items ?? []
  const shown = showAll ? allItems : allItems.slice(0, initialRowCount)

  return (
    <CardBootstrap className={styles.container}>
      {headerContent}
      {<CardListItems items={shown} />}
      {bodyText && (
        <CardBootstrap.Body>
          <CardBootstrap.Text className={styles.body}>
            {bodyText}
          </CardBootstrap.Text>
        </CardBootstrap.Body>
      )}
      {allItems.length > initialRowCount && (
        <SeeMore onClick={handleSeeMoreClick} />
      )}
    </CardBootstrap>
  )
}
