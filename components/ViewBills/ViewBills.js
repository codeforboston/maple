import React from "react";
import { useRouter } from "next/router"
// import { bills } from "../MockAPIResponse"
import { bills } from "../MockAPIResponseBills"
import { Table, Container, NavLink, Button } from 'react-bootstrap'
import ViewBill from "../ViewBill/ViewBill"

const ViewBills = (props) => {
  const router = useRouter()
  
  const billsComponent = !bills ? "" :
    bills.slice(0,20).map((bill, index) => {  // for testing purposes only use the first 20 bills
      const billNumForURL = bill.BillNumber ? bill.BillNumber : bill.DocketNumber
      const url = `/bill/${billNumForURL}`
      return (
      <tr key={index}>
        <td><NavLink href={url}>{bill.BillNumber}</NavLink></td>
        <td>{bill.DocketNumber}</td>
        <td>{bill.Title}</td>
        <td>{bill.PrimarySponsor ? bill.PrimarySponsor.Name : ""}</td>
        <td>0</td>
        <td>
          <Button variant="primary" onClick={() => router.push(`/bill/${billNumForURL}`)}>
            View Bill
          </Button>
          {/* <ViewBill
            bill={bill}
          /> */}
        </td>
      </tr>
      )
    }
  )
  
  return (
    <Container>
      <h1>Most Active Bills </h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Bill #</th>
            <th>Docket #</th>
            <th>Bill Name</th>
            <th>Lead</th>
            <th># Testimony</th>
          </tr>
        </thead>
        <tbody>
          {billsComponent}
        </tbody>
      </Table>
    </Container>
  );
};

export default ViewBills;

