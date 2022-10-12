import { Card } from "react-bootstrap"
import styled from "styled-components"

type bill = {
  id: string
  billNumber: string
  title: string
  approval: string
}

export const PriorityBillsCard = (props: {
  bills: bill[]
  bill_id: string

  //style props
  color: string
  backgroundColor: string
  borderTop: string
  width: string
  height: string
  padding: string
  marginTop: string
  marginBottom: string
  margin: string
  fontWeight: string
  lineHeight: string
  letterSpacing: string
  fontSize: string
  callBack: any
  //
}) => {
  const normal = {
    color: props.color,
    backgroundColor: props.backgroundColor,

    fontFamily: "Nunito",
    borderRadius: "0px",
    borderTop: props.borderTop,

    width: props.width,
    height: props.height,
    padding: props.padding,
    marginTop: props.marginTop,
    marginBottom: props.marginBottom,
    margin: props.margin,
    fontWeight: props.fontWeight,
    lineHeight: props.lineHeight,
    letterSpacing: props.letterSpacing,
    fontSize: props.fontSize
  }
  const header = {
    width: "254px",
    height: "53px",
    color: "white",
    backgroundColor: "#1a3185",
    borderRadius: "15px 15px 0px 0px",
    padding: "0px 0px 5px 0px",
    margin: "0px"
  }
  const tail = {
    borderRadius: "0px 0px 15px 15px",
    height: "87px"
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
          <Card style={style} onClick={props.callBack} key={bill.billNumber}>
            <Card.Body>
              <Card.Title
                style={{
                  fontSize: "22px",
                  margin: "0px",
                  marginTop: "0px",
                  padding: "0px 0px 0px 0px"
                }}
              >
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

//if array changes rerender list with card<bill_id> using selected style
