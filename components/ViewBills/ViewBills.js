// ViewBills.js
import React from "react";
import { useRouter } from "next/router"
import { testimonies } from "../MockTestimonies"
import { Table, Container, NavLink, Button, Spinner, Row } from 'react-bootstrap'
import { useBillContents, useBills } from "../db";
import * as links from "../../components/links.tsx"
import { useMember } from "../db";


// create a hash of bills and their number of testimonies
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


// create a hash of bills and their most recent testimony
const mostRecentTestimonies = testimonies.reduce(function (
  allTestimonies,
  testimony
) {
  const billNumber = testimony.billNumber
  if (billNumber in allTestimonies) {
    // keep the most recent testimony date for each bill
    if (new Date(testimony.dateSubmitted) > new Date(allTestimonies[billNumber]))
    { 
      allTestimonies[billNumber] = testimony.dateSubmitted
    }
  } else {
    allTestimonies[billNumber] = testimony.dateSubmitted
  }
  return allTestimonies
},
{}) 


const invalidSponsorId = (Id) => {
  // we will have to learn more about why certain sponsors have invalid ID's
  return ['GOV7'].includes(Id)
}


const BillRow = (props) => {
  const fullBill = props.bill
  const bill = props.bill.content
  const router = useRouter()
  const {member, loading} = useMember(bill.PrimarySponsor.Id)
  const sponsorURL = bill && bill.PrimarySponsor && bill.PrimarySponsor.Id && !invalidSponsorId(bill.PrimarySponsor.Id) ? `https://malegislature.gov/Legislators/Profile/${bill.PrimarySponsor.Id}/Biography` : ""
  const numCoSponsors = bill.Cosponsors ? bill.Cosponsors.length : 0
  const SponsorComponent = sponsorURL != "" ?   
    <>
      <links.External href={sponsorURL}>{bill.PrimarySponsor.Name}</links.External> 
      - {loading ? "" : member.Branch} - {loading ? "" : member.District} - {loading ? "" : member.Party}
    </>
    :
    <>
      {bill.PrimarySponsor.Name}
    </>
    if (loading) {
      return null
    } else {
      return (
        <tr>
          <td>{bill.BillNumber}</td>
          <td>{bill.Title}</td>
          <td>{SponsorComponent}</td>
          <td>{numCoSponsors}</td>
          <td>{fullBill.testimonyCount}</td>
          <td></td>
          <td>
            {fullBill.latestTestimonyAt &&
              fullBill.latestTestimonyAt.toDate().toLocaleDateString()}
          </td>
          <td>
            <Button variant="primary" onClick={() => router.push(`/bill?id=${bill.BillNumber}`)}>
              View Bill
            </Button>
          </td>
        </tr>
      )
    } 
}


const BillRows = ({bills}) => {
  return bills.map((bill, index) => {
    return (
      <BillRow
        bill = {bill}
        key = {index}
      />
    )
  }
)}


const ViewBills = (props) => {
  // const {bills, loading} = useBillContents()
  const {bills, setSort, loading} = useBills()
  return (
    <Container>
      <h1>Most Active Bills </h1>
      <div className="col-2">
        <select 
          className="form-control"
          onChange={e => {
            const option = e.target.value
            if (option !== "DEFAULT") setSort(option)
          }}
        >
          <option value="DEFAULT">Sort bills by..</option>
          <option value="id">Bill #</option>
          <option value="cosponsorCount"># CoSponsors</option>
          <option value="testimonyCount"># Testimony</option>
          <option value="hearingDate">Hearing date</option>
          <option value="latestTestimony">Most recent testimony</option>
        </select>
      </div>
      <Table className="mt-2" striped bordered hover>
        <thead>
          <tr>
            <th>Bill #</th>
            <th>Bill Name</th>
            <th>Lead</th>
            <th># CoSponsors</th>
            <th># Testimony</th>
            <th>Hearing date</th>
            <th>Most recent testimony</th>
            <th></th>
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
