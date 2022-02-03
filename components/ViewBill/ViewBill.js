import React, {useState} from "react";
import { Button, Modal } from 'react-bootstrap'

function ViewBill() {
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
          <h4>192nd (Current)</h4>
          <b>
            An Act fostering voter opportunities, trust, equity and security
            Text of an amendment, recommended by the committee on Ways and Means, to the Senate Bill fostering voter opportunities, trust, equity and security (Senate, No. 2554). January 26, 2022.
          </b>
          </>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ViewBill;