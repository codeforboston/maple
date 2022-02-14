import React, {useState} from "react";
import { Button, Modal } from 'react-bootstrap'

const BillName = (props) => {
  const bill = props.bill
  const [showBillName, setShowBillName] = useState(false);

  const handleShowBillName = () => setShowBillName(true);
  const handleCloseBillName = () => setShowBillName(false);

    return (
  <>
      <Button variant="primary" className="m-1" onClick={handleShowBillName}>
        Name
      </Button>
      <Modal show={showBillName} onHide={handleCloseBillName} size="lg">
        <Modal.Header closeButton onClick={handleCloseBillName}>
            <Modal.Title>{bill ? bill.BillNumber : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <div className="text-center">
              {bill ? bill.Title : ""}
            </div>
          </>
        </Modal.Body>
      </Modal>
    </>
    )
}

export default BillName