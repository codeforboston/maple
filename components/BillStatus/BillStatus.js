import React, { useState } from "react"
import { Button, Modal } from "react-bootstrap"
import BillHistory from "../BillHistory/BillHistory"
import BillHistoryTable from "../BillHistoryTable/BillHistoryTable"
import { documentHistoryActions } from "../MockAPIResponseDocumentHistoryActions"

const BillStatus = props => {
  const bill = props.bill
  const [showBillStatus, setShowBillStatus] = useState(false)

  const handleShowBillStatus = () => setShowBillStatus(true)
  const handleCloseBillStatus = () => setShowBillStatus(false)
  const history = documentHistoryActions[documentHistoryActions.length - 1]

  return (
    <>
      <Button
        variant="primary"
        className="m-1 text-truncate"
        style={{ maxWidth: "18em" }}
        onClick={handleShowBillStatus}
      >
        Status - {history ? history.Action : "Unknown"}
      </Button>
      <Modal show={showBillStatus} onHide={handleCloseBillStatus} size="lg">
        <Modal.Header closeButton onClick={handleCloseBillStatus}>
          <Modal.Title>{bill ? bill.BillNumber : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <div className="text-center">Bill Status</div>
            <BillHistoryTable documentHistoryActions={[history]} />
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
