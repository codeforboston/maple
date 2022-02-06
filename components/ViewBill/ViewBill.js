import React, {useState} from "react";
import { Button, Modal, Row } from 'react-bootstrap'
import BillTestimonies from '../BillTestimonies/BillTestimonies'

function ViewBill(props) {
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const bill = props.bill

  return (
    <>
      <div className="d-flex justify-content-center">
        <Button variant="primary" onClick={handleShow}>
          View Bill
        </Button>
      </div>
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton onClick={handleClose}>
            <Modal.Title>{bill ? bill.billNumber + " - " + bill.title : ""} </Modal.Title>
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
            <h4 className="mt-2">192nd (Current)</h4>
            <p>
              {bill ? bill.text : ""}
            </p>

            <BillTestimonies
              bill={bill}
            /> 
          </>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleShow}>
            Add your voice
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ViewBill;