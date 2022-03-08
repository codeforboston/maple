import React from "react";
import { Table, Container } from 'react-bootstrap'
import ExpandTestimony from "../ExpandTestimony/ExpandTestimony";
import { usePublishedTestimonyListing } from "../db";


// the word "testimonies": In more general, commonly used, contexts, the plural form will also be testimony.  However, in more specific contexts, the plural form can also be testimonies e.g. in reference to various types of testimonies or a collection of testimonies.


const ViewTestimonies = (props) => {
  const bill = props.bill
  const testimoniesResponse = usePublishedTestimonyListing({billId: bill.BillNumber})
  const testimonies = testimoniesResponse.status == "success" ? testimoniesResponse.result : []

  const testimoniesComponent = testimonies.map((testimony, index) => {
      // need to hide author display name if testimony is anonymous
      return (
        <tr key={index}>
          <td>{testimony.position}</td>
          <td>{testimony.authorDisplayName == null ? "John Doe" : testimony.authorDisplayName }</td>
          <td>{testimony.publishedAt.toDate().toLocaleString()}</td>
          <td>{testimony.content.substring(0,100)}...</td>
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
  )

  return (
    <Container>
      <h1>Submitted testimonies </h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Support</th>
            <th>Submitter</th>
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

export default ViewTestimonies;