import React, {useState} from "react";
import { Button, Modal, Row } from 'react-bootstrap'
import BillTestimonies from '../BillTestimonies/BillTestimonies'
import AddTestimony from '../AddTestimony/AddTestimony'

function ViewBill(props) {
  const [showBill, setShowBill] = useState(false);
  const handleShowBill = () => setShowBill(true);
  const handleCloseBill = () => setShowBill(false);
  const bill = props.bill

  return (
    <>
      <div className="d-flex justify-content-center">
        <Button variant="primary" onClick={handleShowBill}>
          View Bill
        </Button>
      </div>
      <Modal show={showBill} onHide={handleCloseBill} size="lg">
        <Modal.Header closeButton onClick={handleCloseBill}>
          <Modal.Title>
            {bill ? bill.BillNumber + " - " + bill.Title : ""} 
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <div className="text-center">
              <Button className="m-1">Name</Button>
              <Button className="m-1">History</Button>
              <Button className="m-1">Cosponsors</Button>
              <Button className="m-1">Status</Button>
            </div>
            <h4 className="mt-2">{bill ? "General Court: "+ bill.GeneralCourtNumber : ""} </h4>
            <p>
              {bill ? bill.Text : ""}
            </p>

            <BillTestimonies
              bill={bill}
              setShowBill={setShowBill}
            /> 
          </>
        </Modal.Body>
        <Modal.Footer>
          <AddTestimony
            bill={bill}
          />
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ViewBill;