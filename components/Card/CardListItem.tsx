import ListGroup from "react-bootstrap/ListGroup"
import styles from "./CardListItem.module.css"

interface ListItemProps {
  billName: string
  billDescription: string
}

const ListItem = (props: ListItemProps) => {
  const { billName, billDescription } = props
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

export const CardListItems = (props: CardListItemsProps) => {
  const { cardItems = [] } = props
  return (
    <ListGroup className="list-group-flush">
      {cardItems?.map(({ billName, billDescription }) => (
        <ListItem
          key={billName}
          billName={billName}
          billDescription={billDescription}
        />
      ))}
    </ListGroup>
  )
}
