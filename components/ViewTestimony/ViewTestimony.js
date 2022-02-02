import React from "react";
import { bills } from "./MockAPIResponse"
import Table from 'react-bootstrap/Table'

const legislature = "192"

const billsComponent = !bills ? "" :
  bills.map((bill, index) => {
    const billNumForURL = bill.billNumber.replace('.', '')
    const url = `https://malegislature.gov/Bills/${legislature}/${billNumForURL}`
    return (
    <tr key={index}>
      <td><a href={url} target="_blank">{bill.billNumber}</a></td>
      <td>{bill.title}</td>
      <td>{bill.primarySponsor.name}</td>
      <td></td>
    </tr>
    )
  }
)
const ViewTestimony = (props) => {
  return (
    <>
      
      <h1>Most Active Bills </h1>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Bill #</th>
            <th>Bill Name</th>
            <th>Bill Sponsor</th>
            <th># of Testimony</th>
          </tr>
        </thead>
        <tbody>
          {billsComponent}
        </tbody>
      </Table>
    </>
  );
};

export default ViewTestimony;

