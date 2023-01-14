import clsx from "clsx"
import { ReactElement } from "react"
import { ListGroupItemProps } from "react-bootstrap"
import ListGroup from "react-bootstrap/ListGroup"
import styles from "./CardListItem.module.css"

export type ListItemProps = {
  billName: string
  billNameElement?: ReactElement | undefined
  billDescription?: string
  element?: ReactElement
} & ListGroupItemProps

export const ListItem = (props: ListItemProps) => {
  const {
    billName,
    billDescription,
    className,
    element,
    billNameElement,
    ...rest
  } = props
  return (
    <ListGroup.Item className={clsx(styles.item, className)} {...rest}>
      <div className="ms-2 me-auto">
        <div className={`${styles.text} ${styles.billName}`}>
          {billName} {billNameElement && billNameElement}
        </div>
        {billDescription && (
          <span className={`${styles.text} ${styles.billDescription}`}>
            {billDescription}
          </span>
        )}
      </div>
      {element && element}
    </ListGroup.Item>
  )
}

interface CardListItemsProps {
  items: ReactElement[]
}

export const CardListItems = (props: CardListItemsProps) => {
  const { items = [] } = props
  if (items.length <= 0) {
    return <></>
  }
  return <ListGroup className="list-group-flush">{items}</ListGroup>
}
