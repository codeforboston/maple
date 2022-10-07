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
    borderTop: "solid black 2px",
    borderRadius: "0px",
    boxShadow: "0px 1px 5px #000",
    width: "600px",
    padding: "0px 0px 5px 0px",
    margin: "0px"
  }
  const tail = {
    borderRadius: "0px 0px 15px 15px"
  }
  const selected = {
    color: "black",
    backgroundColor: "white"
  }
  const handleClick = () => console.log("click")

  return (
    <>
      {bills.bills.map((bill, index) => {
        const style = { ...normal }
        if (index === bills.bills.length - 1) {
          style.borderRadius = tail.borderRadius
        }
        return (
          <Card style={style} onClick={handleClick}>
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
