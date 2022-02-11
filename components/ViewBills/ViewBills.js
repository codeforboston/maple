import React from "react";
import { useRouter } from "next/router"
import { documents } from "../MockAPIResponseDocuments"
import { testimonies } from "../MockTestimonies"
import { Table, Container, NavLink, Button } from 'react-bootstrap'

const countedTestimonies = testimonies.reduce(function (allTestimonies, testimony) {
  if (testimony.billNumber in allTestimonies) {
    allTestimonies[testimony.billNumber]++
  } else {
    allTestimonies[testimony.billNumber] = 1
  }
  return allTestimonies
}, {}) 

const ViewBills = (props) => {
  const router = useRouter()

  const bills = documents.filter(document => document.BillNumber != null) 
  
  const billsComponent = !bills ? "" :
    bills.slice(0,20).map((bill, index) => {  // for testing purposes only use the first 20 bills
      const billNumForURL = bill.BillNumber
      const url = `/bill/${billNumForURL}`
      
      return (
      <tr key={index}>
        <td><NavLink href={url}>{bill.BillNumber}</NavLink></td>
        <td>{bill.Title}</td>
        <td>{bill.PrimarySponsor ? bill.PrimarySponsor.Name : ""}</td>
        <td>{countedTestimonies[billNumForURL] > 0 ? countedTestimonies[billNumForURL] : 0 }</td>
        <td>
          <Button variant="primary" onClick={() => router.push(`/bill/${billNumForURL}`)}>
            View Bill
          </Button>
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

