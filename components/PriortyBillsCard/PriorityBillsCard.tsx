import { Card } from "react-bootstrap"
import styled from "styled-components"

type bill = {
  id: string
  title: string
  description: string
  approval: string
}

export const PriorityBillsCard = (bills: bill[]) => {
  const normal = {
    color: "white",
    backgroundColor: "navy",
    width: "600px",
    height: "100px",
    borderRadius: "0px",
    margin: "2px"
  }
  const tail = {
    borderRadius: "0px 0px 15px 15px"
  }
  const selected = {
    color: "black",
    backgroundColor: "white"
  }
  return (
    <>
      {bills.bills.map((bill, index) => {
        const style = { ...normal }
        if (index === bills.bills.length - 1) {
          style.borderRadius = tail.borderRadius
        }
        return (
          <Card style={style}>
            <Card.Body>
              <Card.Title>
                {bill.title} {bill.approval}
              </Card.Title>
              <Card.Text>{bill.description}</Card.Text>
            </Card.Body>
          </Card>
        )
      })}
    </>
  )
}

// bill: {
//   id: string
//   title: string
//   description: string
//   approval: string
// }
