import React from "react"
import { Button, Container, Table } from "react-bootstrap"
import { useUpcomingBills } from "../db"
import { formatBillId, formatTimestamp } from "../formatting"
import { Wrap } from "../links"

const BillRow = props => {
  const fullBill = props.bill
  const bill = props.bill.content

  return (
    <tr>
      <td>
        <Wrap href={`/bill?id=${bill.BillNumber}`}>
          <Button variant="primary">{formatBillId(bill.BillNumber)}</Button>
        </Wrap>
      </td>
      <td>{formatTimestamp(fullBill.nextHearingAt)}</td>
    </tr>
  )
}

const BillRows = ({ bills }) => {
  return bills.map((bill, index) => {
    return <BillRow bill={bill} key={index} />
  })
}

const ViewBills = () => {
  const upcomingBills = useUpcomingBills()

  return (
    <Container>
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Bill #</th>
            <th>Hearing Scheduled</th>
          </tr>
        </thead>
        <tbody>{<BillRows bills={upcomingBills} />}</tbody>
      </Table>
    </Container>
  )
}

export default ViewBills
