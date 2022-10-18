import { Card } from "react-bootstrap"
import { Container } from "react-bootstrap"
import Stylez from "./PriorityBillsCard.module.css"

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
  //
}) => {
  return (
    <>
      <Card className={Stylez.header}>
        <Card.Body
          style={{
            paddingTop: "7px",
            paddingBottom: "0px",
            marginBottom: "0px"
          }}
        >
          <Card.Title className={Stylez.billNumber}>Priority Bills</Card.Title>
          <Card.Text className={Stylez.billTitle}>
            Session {props.session}
          </Card.Text>
        </Card.Body>
      </Card>
      {props.bills.map((bill, index) => {
        let style = Stylez.billSlot
        let tail = false
        if (bill.billNumber === props.bill_id) {
          style = Stylez.billSelected
        }
        if (index === props.bills.length - 1) {
          style = Stylez.billTail
          tail = true
        }
        if (bill.billNumber === props.bill_id && tail) {
          style = Stylez.tailSelected
        }
        return (
          <Card className={style} onClick={props.onClick} key={bill.billNumber}>
            <Card.Body style={{ padding: "3px" }}>
              <Card.Title className={Stylez.billNumber}>
                {bill.billNumber}
              </Card.Title>
              <Card.Text className={Stylez.billTitle}>{bill.title}</Card.Text>
            </Card.Body>
          </Card>
        )
      })}
    </>
  )
}

//if array changes rerender list with card<bill_id> using selected style
