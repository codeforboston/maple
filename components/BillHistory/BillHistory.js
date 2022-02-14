import React, {useState} from "react";
import { Button, Modal } from 'react-bootstrap'

const BillHistory = (props) => {
  const bill = props.bill
  const [showBillHistory, setShowBillHistory] = useState(false);

  const handleShowBillHistory = () => setShowBillHistory(true);
  const handleCloseBillHistory = () => setShowBillHistory(false);

    return (
  <>
      <Button variant="primary" className="m-1" onClick={handleShowBillHistory}>
        History
      </Button>
      <Modal show={showBillHistory} onHide={handleCloseBillHistory} size="lg">
        <Modal.Header closeButton onClick={handleCloseBillHistory}>
            <Modal.Title>{bill ? bill.BillNumber : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <div className="text-center">
              Bill History
            </div>
          </>
        </Modal.Body>
      </Modal>
    </>
    )
}

export default BillHistory