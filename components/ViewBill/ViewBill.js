import React, {useState} from "react";
import { Button, Modal, Row } from 'react-bootstrap'
import BillTestimonies from '../BillTestimonies/BillTestimonies'

function ViewBill(props) {
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  return (
    <>
      <div className="d-flex justify-content-center">
        <Button variant="primary" onClick={handleShow}>
          View Bill
        </Button>
      </div>
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton onClick={handleClose}>
            <Modal.Title>Bill H.4359</Modal.Title>
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
              An Act fostering voter opportunities, trust, equity and security
              Text of an amendment, recommended by the committee on Ways and Means, to the Senate Bill fostering voter opportunities, trust, equity and security (Senate, No. 2554). January 26, 2022.
            </p>

            <BillTestimonies/> 
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