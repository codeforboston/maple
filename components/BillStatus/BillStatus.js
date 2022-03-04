import React, {useState} from "react";
import { Button, Modal } from 'react-bootstrap'
import { documentHistoryActions } from "../MockAPIResponseDocumentHistoryActions";
import BillHistory from "../BillHistory/BillHistory";
import BillHistoryTable from "../BillHistoryTable/BillHistoryTable";

const BillStatus = (props) => {
  const bill = props.bill
  const [showBillStatus, setShowBillStatus] = useState(false);

  const handleShowBillStatus = () => setShowBillStatus(true);
  const handleCloseBillStatus = () => setShowBillStatus(false);

    return (
  <>
      <Button variant="primary" className="m-1" onClick={handleShowBillStatus}>
        Status
      </Button>
      <Modal show={showBillStatus} onHide={handleCloseBillStatus} size="lg">
        <Modal.Header closeButton onClick={handleCloseBillStatus}>
            <Modal.Title>{bill ? bill.BillNumber : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <div className="text-center">
              Bill Status
            </div>
            <BillHistoryTable documentHistoryActions={[documentHistoryActions[documentHistoryActions.length - 1]]}/>
            <div className=" d-flex justify-content-center">
              <BillHistory bill={bill} />
            </div>
          </>
        </Modal.Body>
      </Modal>
    </>
    )
}

export default BillStatus