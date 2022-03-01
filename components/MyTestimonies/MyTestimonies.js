import React from "react";
import { testimonies } from "../MockTestimonies"
import { Table, Container } from 'react-bootstrap'
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony";
import { useAuth } from "../../components/auth"
import { useBillContent } from "../db";

const TestimonyRow = ({testimony}) => { 
  const {bill, loading} = useBillContent(testimony.billNumber)
  if (loading) {
    return null
  } else {
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
      if (testimony.submitter === "sample.user@gmail.com") {  // replace with below line when want to show only the user's testimonies
      // if (testimony.submitter === userEmail) {
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

