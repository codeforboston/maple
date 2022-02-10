import React from "react";
import { testimonies } from "../MockTestimonies"
import { Table, Container } from 'react-bootstrap'

// The noun testimony can be countable or uncountable.
// In more general, commonly used, contexts, the plural form will also be testimony.
// However, in more specific contexts, the plural form can also be testimonies e.g. in reference to various types of testimonies or a collection of testimonies.

const ViewTestimonies = (props) => {
  const bill = props.bill
  const testimoniesComponent = !testimonies ? "" :
    testimonies.map((testimony, index) => {
      if (testimony.billNumber === bill.BillNumber || testimony.billNumber === bill.DocketNumber) {
        return (
          <tr key={index}>
            <td>{testimony.support}</td>
            <td>{testimony.submitter}</td>
            <td>{testimony.dateSubmitted}</td>
            <td>{testimony.text.substring(0,100)}...</td>
          </tr>
        )
      } else {
        return
      }
    }
  )

  return (
    <Container>
      
      <h1>Submitted testimonies </h1>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Support</th>
            <th>Submitter</th>
            <th>Date Submittedxx</th>
            {/* why isn't this xx showing up on the testimony pop up? */}
            <th>Text</th>
          </tr>
        </thead>
        <tbody>
          {testimoniesComponent}
        </tbody>
      </Table>
    </Container>
  );
};

export default ViewTestimonies;

