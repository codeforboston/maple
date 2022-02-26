import React, {useState} from "react";
import { Button, Modal } from 'react-bootstrap'

const ExpandTestimony = (props) => {
  const bill = props.bill
  const testimony = props.testimony
  const [showTestimony, setShowTestimony] = useState(false);

  const handleShowTestimony = () => setShowTestimony(true);
  const handleCloseTestimony = () => setShowTestimony(false);

  return (
  <>
    <div className="d-flex justify-content-center">
      <Button variant="primary" onClick={handleShowTestimony}>
        Expand
      </Button>
    </div>

    <Modal show={showTestimony} onHide={handleCloseTestimony} size="lg">
      <Modal.Header closeButton onClick={handleCloseTestimony}>
          <Modal.Title>{bill ? bill.BillNumber + " - " + bill.Title : ""}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <h4>{testimony ? testimony.submitter + " - " + testimony.dateSubmitted + " - " + testimony.support : ""}</h4>
          <p>{testimony ? testimony.text : ""}</p>
          <h4>
            {testimony && testimony.attachment != null ? 
            <Button variant="primary">
              See attachment
            </Button> 
            : 
            ""}
          </h4>
      </Modal.Body>
    </Modal>
  </>
  )
}

export default ExpandTestimony