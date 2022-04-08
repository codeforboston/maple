import { useRouter } from "next/router"
import React from "react"
import { Button, Container, Table } from "react-bootstrap"
import { useUpcomingBills, useMember } from "../db"
import { formatBillId } from "../formatting"
import { Wrap } from "../links"

const BillRow = props => {
  const fullBill = props.bill
  const bill = props.bill.content
  const router = useRouter()
  const { member, loading } = useMember(
    bill.PrimarySponsor ? bill.PrimarySponsor.Id : null
  )

  if (loading) {
    return null
  } else {
    return (
      <tr>
        <td>
          <Wrap href={`/bill?id=${bill.BillNumber}`}>
            <Button variant="primary">{formatBillId(bill.BillNumber)}</Button>
          </Wrap>
        </td>
        <td>{fullBill.nextHearingAt?.toDate().toLocaleDateString()}</td>
      </tr>
    )
  }
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
