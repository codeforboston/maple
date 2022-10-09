import { Card } from "react-bootstrap"
import styled from "styled-components"

type bill = {
  id: string
  billNumber:string,
  title: string
  approval: string
}

export const PriorityBillsCard = (props: { bills: bill[], bill_id:string, }) => {
  const normal = {
    color: "white",
    backgroundColor: "#1a3185",

    fontFamily:"Nunito",
    fontWeight: "600px",
    lineHeight:"15px",
    letterSpacing:"3%",
    fontSize: "12px",

    borderTop: "solid white 1px",
    borderRadius: "0px",
    width: "254px",
    height:"79px",
    padding: "0px 0px 15px 0px",
    margin: "0px",
    
  }
  const header = {
    
    width: "254px",
    height:"53px",
    color: "white",
    backgroundColor: "#1a3185",
    borderRadius: "15px 15px 0px 0px",
    padding: "0px 0px 5px 0px",
    margin: "0px"
  }
  const tail = {
    borderRadius: "0px 0px 15px 15px",
    height:"87px"
  }
  const selected = {
    color: "black",
    backgroundColor: "white"
  }

  return (
    <>
      <Card style={header}>
        <Card.Body>
          <Card.Title>Priority Bills</Card.Title>
          <Card.Text>Session*</Card.Text>
        </Card.Body>
      </Card>
      {props.bills.map((bill, index) => {
        const style = { ...normal }
        if (index === props.bills.length - 1) {
          style.borderRadius = tail.borderRadius
        }
        return (
          <Card style={style} >
            <Card.Body>
              <Card.Title>
                {bill.billNumber} {bill.approval}
              </Card.Title>
              <Card.Text>{bill.title}</Card.Text>
            </Card.Body>
          </Card>
        )
      })}
    </>
  )
}
