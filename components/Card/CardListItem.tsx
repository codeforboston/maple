import ListGroup from "react-bootstrap/ListGroup"
import styles from "./CardListItem.module.css"

interface ListItemProps {
  billName: string
  billDescription: string
}

const ListItem = (ListItemProps: ListItemProps): typeof ListItem => {
  const { billName, billDescription } = ListItemProps
  return (
    <ListGroup.Item className={styles.item}>
      <div className="ms-2 me-auto">
        <div className={`${styles.text} ${styles.billName}`}>{billName}</div>
        <span className={`${styles.text} ${styles.billDescription}`}>
          {billDescription}
        </span>
      </div>
    </ListGroup.Item>
  )
}

interface CardListItemsProps {
  cardItems: {
    billName: string
    billDescription: string
  }[]
}

export const CardListItems = (
  CardListItemsProps: CardListItemsProps
): typeof CardListItems => {
  const { cardItems = [] } = CardListItemsProps
  return (
    <ListGroup className="list-group-flush">
      {cardItems?.map(({ billName, billDescription }): typeof ListItem => (
        <ListItem billName={billName} billDescription={billDescription} />
      ))}
    </ListGroup>
  )
}
