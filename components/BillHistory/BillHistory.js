import React, {useState} from "react";
import { Button, Modal, Table } from 'react-bootstrap'
import BillHistoryTable from "../BillHistoryTable/BillHistoryTable";
import { documentHistoryActions } from "../MockAPIResponseDocumentHistoryActions";

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
            <Modal.Title>{bill ? bill.BillNumber + " - " + bill.Title : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <BillHistoryTable documentHistoryActions={documentHistoryActions} />
          </>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default BillHistory