import React, {useState} from "react";
import { Button, Modal } from 'react-bootstrap'

const BillCosponsors = (props) => {
  const bill = props.bill
  const [showBillCosponsors, setShowBillCosponsors] = useState(false);

  const handleShowBillCosponsors = () => setShowBillCosponsors(true);
  const handleCloseBillCosponsors = () => setShowBillCosponsors(false);

    return (
  <>
      <Button variant="primary" className="m-1" onClick={handleShowBillCosponsors}>
        Cosponsors
      </Button>
      <Modal show={showBillCosponsors} onHide={handleCloseBillCosponsors} size="lg">
        <Modal.Header closeButton onClick={handleCloseBillCosponsors}>
            <Modal.Title>{bill ? bill.BillNumber : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <div className="text-center">
              Bill Cosponsors
            </div>
          </>
        </Modal.Body>
      </Modal>
    </>
    )
}

export default BillCosponsors