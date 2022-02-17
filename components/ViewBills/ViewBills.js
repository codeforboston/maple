import React from "react";
import { useRouter } from "next/router"
import { testimonies } from "../MockTestimonies"
import { Table, Container, NavLink, Button, Spinner, Row } from 'react-bootstrap'
import { useBills } from "../db";

const countedTestimonies = testimonies.reduce(function (
  allTestimonies,
  testimony
) {
  if (testimony.billNumber in allTestimonies) {
    allTestimonies[testimony.billNumber]++
  } else {
    allTestimonies[testimony.billNumber] = 1
  }
  return allTestimonies
},
{}) 

const invalidSponsorId = (Id) => {
  // we will have to learn more about why certain sponsors have invalid ID's
  return ['GOV7'].includes(Id)
}

const BillRows = ({bills}) => {
  const router = useRouter()
  return bills.map((bill, index) => {
    const sponsorURL = bill && bill.PrimarySponsor && bill.PrimarySponsor.Id && !invalidSponsorId(bill.PrimarySponsor.Id) ? `https://malegislature.gov/Legislators/Profile/${bill.PrimarySponsor.Id}` : ""
    const numCoSponsors = bill.Cosponsors ? bill.Cosponsors.length : 0
  
    return (
    <tr key={index}>
      <td>{bill.BillNumber}</td>
      <td>{bill.Title}</td>
      <td><NavLink href={sponsorURL} target="_blank" rel="noreferrer">{bill.PrimarySponsor.Name}</NavLink></td>
      <td>{numCoSponsors}</td>
      <td>{countedTestimonies[bill.BillNumber] > 0 ? countedTestimonies[bill.BillNumber] : 0 }</td>
      <td>
        <Button variant="primary" onClick={() => router.push(`/bill?id=${bill.BillNumber}`)}>
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
            <th># CoSponsors</th>
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

