import React from "react";
import { Table, Container } from 'react-bootstrap'
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony";
import { useAuth } from "../../components/auth"
import { useBill, usePublishedTestimonyListing } from "../db";

const TestimonyRow = ({testimony}) => { 
  const { result: bill } = useBill(testimony.billId)

  if (!bill) {
    return null
  } else {
    return (
      <tr>
        <td>{testimony.position}</td>
        <td>{testimony.billId}</td>
        <td>{testimony.publishedAt.toDate().toLocaleString()}</td>
        <td>{testimony.content.substring(0,100)}...</td>
        <td>{testimony.attachment != null ? "Yes" : ""}</td>
        <td>
          <ExpandTestimony
            bill={bill.content}
            testimony={testimony}
          />
        </td>
      </tr>
    )
  }
}

const MyTestimonies = () => {
  const { user, authenticated } = useAuth()
  // change to 2nd line below when sufficient testimony in sample database
  const userUid = "c8Z3AdZKX0gfEHdQ102AUW14lbG2"  
  // const userUid = user ? user.uid : null
  const testimoniesResponse = usePublishedTestimonyListing(userUid)
  const testimonies = testimoniesResponse.status == "loading" || testimoniesResponse.status == "error" ? [] : testimoniesResponse.result
  const testimoniesComponent = !testimonies ? "" :
    testimonies.map((testimony, index) => {
      return (
        <TestimonyRow
          testimony={testimony}
          key={index}
        />
      )
    }
  )

  return (
    <Container>
      <h1>My Testimonies </h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Support</th>
            <th>Bill #</th>
            <th>Date Submitted</th>
            <th>Text</th>
            <th>Attachment?</th>
          </tr>
        </thead>
        <tbody>
          {testimoniesComponent}
        </tbody>
      </Table>
    </Container>
  );
};

export default MyTestimonies;

