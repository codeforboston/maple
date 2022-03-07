import React, {useState} from "react";
import { Button, Modal } from 'react-bootstrap'

const DeleteTestimony = (props) => {
  const bill = props.bill
  const testimony = props.testimony
  const [showTestimony, setShowTestimony] = useState(false);

  const handleShowTestimony = () => setShowTestimony(true);
  const handleCloseTestimony = () => setShowTestimony(false);
  return (
  <>
    <Button variant="primary" onClick={handleShowTestimony}>
      Delete
    </Button>
    <Modal show={showTestimony} onHide={handleCloseTestimony} size="lg">
      <Modal.Header closeButton onClick={handleCloseTestimony}>
        <Modal.Title>{bill ? bill.BillNumber + " - " + bill.Title : ""}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete your testimony for this bill?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary">
            Delete
        </Button>
        <Button>
            Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  </>
  )
}

export default DeleteTestimony