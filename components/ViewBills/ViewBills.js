import React from "react";
import { bills } from "../MockAPIResponse"
import { Table, Container } from 'react-bootstrap'
import ViewBill from "../ViewBill/ViewBill"

const legislature = "192"

const billsComponent = !bills ? "" :
  bills.map((bill, index) => {
    const billNumForURL = bill.billNumber.replace('.', '')
    const url = `https://malegislature.gov/Bills/${legislature}/${billNumForURL}`
    return (
    <tr key={index}>
      <td><a href={url} rel="noreferrer" target="_blank">{bill.billNumber}</a></td>
      <td>{bill.title}</td>
      <td>{bill.primarySponsor.name}</td>
      <td>0</td>
      <td>
        <ViewBill
          bill={bill}
        />
      </td>
    </tr>
    )
  }
)
const ViewBills = (props) => {
  return (
    <Container>
      
      <h1>Most Active Bills </h1>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Bill #</th>
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

