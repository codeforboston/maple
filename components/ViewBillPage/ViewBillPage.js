import React from "react";

import { bills } from "../MockTestimonies"
import { Button, Row } from 'react-bootstrap'
import BillTestimonies from '../BillTestimonies/BillTestimonies'
import AddTestimony from '../AddTestimony/AddTestimony'

const ViewBillPage = (props) => {
  const bill = props.bill

  return (
    <>
      <Row>
        <div className="text-center">
          <Button className="m-1">Name</Button>
          <Button className="m-1">History</Button>
          <Button className="m-1">Cosponsors</Button>
          <Button className="m-1">Status</Button>
        </div>
      </Row>
      <h4 className="mt-2">{bill ? bill.billNumber + "  General Court: "+ bill.generalCourtNumber : ""} </h4>
      <div className="d-flex justify-content-center">

        <p>
          {bill ? bill.text : ""}
        </p>

        <BillTestimonies
          bill={bill}
        /> 
      </div>
    </>
  );
};

export default ViewBillPage;
