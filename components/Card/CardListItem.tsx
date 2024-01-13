import clsx from "clsx"
import { ReactElement } from "react"
import { ListGroupItemProps } from "react-bootstrap"
import ListGroup from "react-bootstrap/ListGroup"

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
    <ListGroup.Item
      className={
        clsx(className) +
        `align-items-center bg-secondary border-bottom border-white d-flex text-white`
      }
      {...rest}
      style={{
        height: "80px"
      }}
    >
      <div className="ms-2 me-auto">
        <div className={`fs-4 fw-lighter lh-sm`}>
          {billName} {billNameElement && billNameElement}
        </div>
        {billDescription && (
          <span className={`fs-6 fw-lighter lh-sm`}>{billDescription}</span>
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
