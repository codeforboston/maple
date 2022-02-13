import React from "react";
import { Button, Row } from 'react-bootstrap'
import BillTestimonies from '../BillTestimonies/BillTestimonies'
import AddTestimony from '../AddTestimony/AddTestimony'
import BillName from '../BillName/BillName'
import BillHistory from '../BillHistory/BillHistory'
import BillCosponsors from '../BillCosponsors/BillCosponsors'
import BillStatus from '../BillStatus/BillStatus'

const ViewBillPage = (props) => {
  const bill = props.bill
  return (
    <>
      <Row>
        <div className=" d-flex justify-content-center">
          <BillName bill={bill}/>
          <BillHistory bill={bill}/>
          <BillCosponsors bill={bill}/>
          <BillStatus bill={bill}/>
        </div>
      </Row>
      <div className="text-center">
        <h4>{bill ? bill.BillNumber + "  General Court: "+ bill.GeneralCourtNumber : ""} </h4>
        <h4>{bill ? bill.Title : ""}</h4>
      </div>
      <div>
        {(bill && bill.DocumentText != null) ? bill.DocumentText.substring(1,700)+"..." : ""}
      </div>
      <BillTestimonies
        bill={bill}
      /> 
      <AddTestimony
        bill={bill}
      /> 
    </>
  );
};

export default ViewBillPage;
