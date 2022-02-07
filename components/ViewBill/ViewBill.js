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
            {bill ? bill.billNumber + " - " + bill.title : ""} 
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <div className="col-md-12 text-center">
            <Row>
              <Button>Name</Button>
              <Button className="ml-2">History</Button>
              <Button className="ml-2">Cosponsors</Button>
              <Button className="ml-2">Status</Button>
            </Row>
            </div>
            <h4 className="mt-2">{bill ? "General Court: "+ bill.generalCourtNumber : ""} </h4>
            <p>
              {bill ? bill.text : ""}
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