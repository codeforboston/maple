import { ReactElement, useState } from "react"
import CardBootstrap from "react-bootstrap/Card"
import styled from "styled-components"
import { CardListItems, ListItem } from "./CardListItem"
import { CardTitle } from "./CardTitle"
import { SeeMore } from "./SeeMore"

const SurfaceCard = styled(CardBootstrap)`
  background-color: var(--maple-surface-base);
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--maple-radius-lg);
  box-shadow: var(--maple-shadow-sm);
  overflow: hidden;
`

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
    <CardBootstrap.Body className="align-items-center d-flex px-2 pt-2 pb-0">
      <CardBootstrap.Body className="px-3 py-0">
        <CardTitle>
          <CardBootstrap.Title className="align-items-start fs-6 lh-sm mb-1 text-secondary">
            <strong>{header}</strong>
          </CardBootstrap.Title>
        </CardTitle>
      </CardBootstrap.Body>
    </CardBootstrap.Body>
  ) : (
    headerElement ?? null
  )

  const bodyContent = body ? (
    body
  ) : bodyText ? (
    <CardBootstrap.Body>
      <CardBootstrap.Text className="fs-base fw-lighter lh-sm">
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
    <SurfaceCard className={className}>
      {headerContent}
      {<CardListItems items={shown} />}
      {bodyContent}
      {allItems.length > initialRowCount && (
        <SeeMore onClick={handleSeeMoreClick} />
      )}
    </SurfaceCard>
  )
}
