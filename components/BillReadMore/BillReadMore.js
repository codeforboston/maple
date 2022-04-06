import React, { useState } from "react"
import { Button, Modal } from "react-bootstrap"

const BillReadMore = ({ bill }) => {
  const [show, setShow] = useState(false)

  const handleShow = () => setShow(true)
  const handleClose = () => setShow(false)

  return (
    <>
      <div className="d-flex justify-content-center mt-2">
        <Button variant="primary" onClick={handleShow}>
          Read More
        </Button>
      </div>

      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton onClick={handleClose}>
          <Modal.Title>
            {bill ? bill.BillNumber + " - " + bill.Title : ""}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div style={{ whiteSpace: "pre-wrap" }}>
            <span>{bill.DocumentText}</span>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default BillReadMore
