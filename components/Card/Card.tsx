import clsx from "clsx"
import { ReactElement, useState } from "react"
import CardBootstrap from "react-bootstrap/Card"
import styles from "./Card.module.css"
import { CardListItems, ListItem } from "./CardListItem"
import { CardTitle } from "./CardTitle"
import { SeeMore } from "./SeeMore"

interface CardItem {
  billName: string
  billNameElement?: ReactElement | undefined
  billDescription: string
  element?: ReactElement | undefined
}

interface CardProps {
  header?: string | undefined
  imgSrc?: string | undefined
  subheader?: string | undefined
  bodyText?: string | undefined | ReactElement
  timestamp?: string | undefined
  cardItems?: CardItem[] | undefined
  inHeaderElement?: ReactElement | undefined
  items?: ReactElement[]
  headerElement?: ReactElement
  body?: ReactElement
  initialRowCount?: number
  className?: string
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
    inHeaderElement,
    headerElement,
    body,
    initialRowCount = 3,
    className
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
    ? cardItems?.map(
        ({ billName, billDescription, element, billNameElement }) => (
          <ListItem
            key={billName}
            billName={billName}
            billNameElement={billNameElement}
            billDescription={billDescription}
            element={element}
          />
        )
      )
    : items ?? []
  const shown = showAll ? allItems : allItems.slice(0, initialRowCount)

  return (
    <CardBootstrap className={clsx(className, styles.container)}>
      {headerContent}
      {<CardListItems items={shown} />}
      {bodyContent}
      {allItems.length > initialRowCount && (
        <SeeMore onClick={handleSeeMoreClick} />
      )}
    </CardBootstrap>
  )
}
