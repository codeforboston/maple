import clsx from "clsx"
import { ReactElement, ReactNode } from "react"
import { ListGroupItemProps } from "react-bootstrap"
import ListGroup from "react-bootstrap/ListGroup"
import styles from "./CardListItem.module.css"

type ListItemProps = {
  billName: string
  billDescription?: string
  element: ReactElement | undefined
} & ListGroupItemProps

export const ListItem = (props: ListItemProps) => {
  const { billName, billDescription, className, ...rest } = props
  return (
    <ListGroup.Item className={clsx(styles.item, className)} {...rest}>
      <div className="ms-2 me-auto">
        <div className={`${styles.text} ${styles.billName}`}>{billName}</div>
        {billDescription && (
          <span className={`${styles.text} ${styles.billDescription}`}>
            {billDescription}
          </span>
        )}
      </div>
      {props.element && props.element}
    </ListGroup.Item>
  )
}

interface CardListItemsProps {
  items: ReactElement[]
}

export const CardListItems = (props: CardListItemsProps) => {
  const { items = [] } = props
  return <ListGroup className="list-group-flush">{items}</ListGroup>
}
