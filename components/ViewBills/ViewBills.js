import React from "react";
import { bills } from "../MockAPIResponse"
import { Table, Container, Spinner, Row } from 'react-bootstrap'
import ViewBill from "../ViewBill/ViewBill"
import { useBills } from "../db";

const legislature = "192"

const BillRows = ({bills}) => 
  bills.map((bill, index) => {
    const billNumForURL = bill.BillNumber.replace('.', '')
    const url = `https://malegislature.gov/Bills/${legislature}/${billNumForURL}`
    return (
    <tr key={index}>
      <td><a href={url} rel="noreferrer" target="_blank">{bill.BillNumber}</a></td>
      <td>{bill.Title}</td>
      <td>{bill.PrimarySponsor.Name}</td>
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
  const {bills, loading} = useBills()
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
          {!loading && <BillRows bills={bills}/>}
        </tbody>
      </Table>
      <Row>
        {loading && <Spinner animation="border" className="mx-auto"/>}
      </Row>
    </Container>
  );
};

export default ViewBills;

