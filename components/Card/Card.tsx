import React, { ReactElement, useState } from "react"
import CardBootstrap from "react-bootstrap/Card"
import styles from "./Card.module.css"
import { CardListItems, ListItem } from "./CardListItem"
import { CardTitle } from "./CardTitle"
import { SeeMore } from "./SeeMore"

interface CardItem {
  billName: string
  billDescription: string
  element?: ReactElement | undefined
}

interface CardProps {
  header?: string | undefined
  imgSrc?: string | undefined
  subheader?: string | undefined
  bodyText?: string | undefined
  bodyImage?: string | undefined
  timestamp?: string | undefined
  cardItems?: CardItem[] | undefined
  inHeaderElement?: ReactElement | undefined
  items?: ReactElement[]
  headerElement?: ReactElement
  body?: ReactElement
}

export const Card = (CardProps: CardProps) => {
  const {
    header,
    imgSrc,
    subheader,
    bodyText,
    bodyImage,
    timestamp,
    cardItems,
    items,
    inHeaderElement,
    headerElement,
    body
  } = CardProps

  const headerContent = header ? (
    <CardTitle
      header={header}
      subheader={subheader}
      timestamp={timestamp}
      imgSrc={imgSrc}
      inHeaderElement={inHeaderElement}
    />
  ) : headerElement ? (
    headerElement
  ) : null

  const bodyContent = body ? (
    body
  ) : bodyText ? (
    <CardBootstrap.Body>
      {bodyImage && (
        <img
          src={bodyImage}
          alt=""
          style={{
            width: "110%",
            margin: "-1.1rem -1rem 0 -1rem"
          }}
        />
      )}
      <CardBootstrap.Text className={styles.body}>
        {bodyText}
      </CardBootstrap.Text>
    </CardBootstrap.Body>
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
    ? cardItems?.map(({ billName, billDescription, element }) => (
        <ListItem
          key={billName}
          billName={billName}
          billDescription={billDescription}
          element={element}
        />
      ))
    : items ?? []
  const shown = showAll ? allItems : allItems.slice(0, 3)

  return (
    <CardBootstrap className={styles.container}>
      {headerContent}
      {<CardListItems items={shown} />}
      {bodyContent}
      {allItems.length > 3 && <SeeMore onClick={handleSeeMoreClick} />}
    </CardBootstrap>
  )
}
