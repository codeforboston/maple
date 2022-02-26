import React from "react";
import { testimonies } from "../MockTestimonies"
import { Table, Container } from 'react-bootstrap'
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony";
import { useAuth } from "../../components/auth"
import { useBill } from "../db"
import { useBillContents } from "../db";

// the word "testimonies": In more general, commonly used, contexts, the plural form will also be testimony.  However, in more specific contexts, the plural form can also be testimonies e.g. in reference to various types of testimonies or a collection of testimonies.

const TestimonyRow = ({testimony}) => {
  // neither of the below are working - bill remains "undefined"
  // const {bill, loading} = useBill(testimony.billNumber) 
  const {bill, loading} = useBillContents(testimony.billNumber)
  if (loading) {
    return null
  } else {
    console.log("bill# |" + testimony.billNumber+"|")
    console.log(bill)
    return (
      <tr>
        <td>{testimony.support}</td>
        <td>{testimony.billNumber}</td>
        <td>{testimony.dateSubmitted}</td>
        <td>{testimony.text.substring(0,100)}...</td>
        <td>{testimony.attachment != null ? "Yes" : ""}</td>
        <td>
          <ExpandTestimony
            bill={bill}
            testimony={testimony}
          />
        </td>
      </tr>
    )
  }
}

const MyTestimonies = () => {
  const { user, authenticated } = useAuth()
  const userEmail = authenticated ? user.email : ""
  const testimoniesComponent = !testimonies ? "" :
    testimonies.map((testimony, index) => {
      if (testimony.submitter === userEmail) {
        return (
          <TestimonyRow
            testimony={testimony}
            key={index}
          />
        )
      } else {
        return
      }
    }
  )

  return (
    <Container>
      <h1>My testimonies </h1>
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

