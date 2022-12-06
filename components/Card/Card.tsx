import { ReactElement, useState } from "react"
import CardBootstrap from "react-bootstrap/Card"
import { Col, Container, Row } from "../bootstrap"
import { LabeledIcon } from "../shared"
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

interface CardObject {
  id: number
  Name: string
  sponsorType: string
}

interface CardProps {
  header?: string | undefined
  imgSrc?: string | undefined
  subheader?: string | undefined
  bodyText?: string | undefined | ReactElement
  timestamp?: string | undefined
  cardItems?: CardItem[] | undefined
  cardObjects?: CardObject[][] | undefined
  numOfSponsors?: number | undefined
  inHeaderElement?: ReactElement | undefined
  items?: ReactElement[]
  headerElement?: ReactElement
  body?: ReactElement
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
    cardObjects,
    numOfSponsors,
    items,
    inHeaderElement,
    headerElement,
    body,
    initialRowCount = 3
  } = CardProps

  const [cardItemsToDisplay, setCardItemsToDisplay] = useState<
    CardItem[] | undefined
  >(cardItems?.slice(0, 3))
  const [cardObjectsToDisplay, setCardObjectsToDisplay] = useState<
    CardObject[][] | undefined
  >(cardObjects?.slice(0, 1))

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

  const handleSeeMoreObjects = (event: string): void => {
    if (event === "SEE_MORE") {
      setCardObjectsToDisplay(cardObjects)
      return
    }
    setCardObjectsToDisplay(cardObjects?.slice(0, 1))
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
    <CardBootstrap className={styles.container}>
      {headerContent}
      {<CardListItems items={shown} />}
      {bodyContent}
      {allItems.length > initialRowCount && (
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
