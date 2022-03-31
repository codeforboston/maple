import { useRouter } from "next/router"
import React from "react"
import { Button, Container, Row, Spinner, Table } from "react-bootstrap"
import { useBills, useMember } from "../db"
import { formatBillId } from "../formatting"

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
          <Button
            variant="primary"
            onClick={() => router.push(`/bill?id=${bill.BillNumber}`)}
          >
            {formatBillId(bill.BillNumber)}
          </Button>
        </td>
        <td>{bill.Title}</td>
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
  const { bills, loading } = useBills()

  return (
    <Container>
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Bill #</th>
            <th>Bill Name</th>
            <th>Hearing Scheduled</th>
          </tr>
        </thead>
        <tbody>{bills && <BillRows bills={bills} />}</tbody>
      </Table>
      <Row>{loading && <Spinner animation="border" className="mx-auto" />}</Row>
    </Container>
  )
}

export default ViewBills
