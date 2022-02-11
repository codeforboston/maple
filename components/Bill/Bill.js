import React from "react";
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
      <div className="text-center">
        <h4>{bill ? bill.BillNumber + "  General Court: "+ bill.GeneralCourtNumber : ""} </h4>
        <h4>{bill ? bill.Title : ""}</h4>
      </div>
      <div>
        {bill ? bill.DocumentText.substring(1,700)+"..." : ""}
      </div>
      <BillTestimonies
        bill={bill}
      /> 
      <AddTestimony/> 
    </>
  );
};

export default ViewBillPage;
