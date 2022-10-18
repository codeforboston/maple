import { Card } from "react-bootstrap"
import Styles from "./PriorityBillsCard.module.css"

type bill = {
  id: string
  billNumber: string
  title: string
  approval: string
}

export const PriorityBillsCard = (props: {
  bills: bill[]
  bill_id: string
  session: string
  onClick: any
}) => {
  return (
    <>
      <Card className={Styles.header}>
        <Card.Body
          style={{
            paddingTop: "7px",
            paddingBottom: "0px",
            marginBottom: "0px"
          }}
        >
          <Card.Title className={Styles.billNumber}>Priority Bills</Card.Title>
          <Card.Text className={Styles.billTitle}>
            Session {props.session}
          </Card.Text>
        </Card.Body>
      </Card>
      {props.bills.map((bill, index) => {
        let style = Styles.billSlot
        let tail = false
        if (bill.billNumber === props.bill_id) {
          style = Styles.billSelected
        }
        if (index === props.bills.length - 1) {
          style = Styles.billTail
          tail = true
        }
        if (bill.billNumber === props.bill_id && tail) {
          style = Styles.tailSelected
        }
        return (
          <Card className={style} onClick={props.onClick} key={bill.billNumber}>
            <Card.Body style={{ padding: "3px" }}>
              <Card.Title className={Styles.billNumber}>
                {bill.billNumber}
              </Card.Title>
              <Card.Text className={Styles.billTitle}>{bill.title}</Card.Text>
            </Card.Body>
          </Card>
        )
      })}
    </>
  )
}
