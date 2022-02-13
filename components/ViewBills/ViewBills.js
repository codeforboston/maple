import React from "react";
import { useRouter } from "next/router"
import { testimonies } from "../MockTestimonies"
import { Table, Container, NavLink, Button, Spinner, Row } from 'react-bootstrap'
import { useBills } from "../db";

// const countedTestimonies = testimonies.reduce(function (allTestimonies, testimony) {
//   if (testimony.billNumber in allTestimonies) {
//     allTestimonies[testimony.billNumber]++
//   } else {
//     allTestimonies[testimony.billNumber] = 1
//     return allTestimonies
//   }
// }) 

const legislature = "192"

const BillRows = ({bills}) => {
  const router = useRouter()
  return bills.map((bill, index) => {
  const billNumForURL = bill.BillNumber
  const url = `/bill/${billNumForURL}`
    return (
    <tr key={index}>
      <td><NavLink href={url}>{bill.BillNumber}</NavLink></td>
      <td>{bill.Title}</td>
      <td>{bill.PrimarySponsor.Name}</td>
      {/* <td>{countedTestimonies[billNumForURL] > 0 ? countedTestimonies[billNumForURL] : 0 }</td> */}
      <td>
        <Button variant="primary" onClick={() => router.push(`/bill/${billNumForURL}`)}>
          View Bill
        </Button>
      </td>
    </tr>
    )
  }
)}

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

