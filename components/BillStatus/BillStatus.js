import { last } from "lodash"
import React, { useState } from "react"
import { Button, Modal } from "react-bootstrap"
import BillHistory from "../BillHistory/BillHistory"
import BillHistoryTable from "../BillHistoryTable/BillHistoryTable"

const BillStatus = ({ bill, billHistory }) => {
  const [showBillStatus, setShowBillStatus] = useState(false)

  const handleShowBillStatus = () => setShowBillStatus(true)
  const handleCloseBillStatus = () => setShowBillStatus(false)
  const history = last(billHistory)

  return (
    <>
      <Button
        variant="primary"
        className="m-1 text-truncate"
        style={{ maxWidth: "18em" }}
        onClick={handleShowBillStatus}
      >
        Status: {history ? history.Action : "Unknown"}
      </Button>
      <Modal show={showBillStatus} onHide={handleCloseBillStatus} size="lg">
        <Modal.Header closeButton onClick={handleCloseBillStatus}>
          {bill ? bill.BillNumber + " - " + bill.Title : ""}
        </Modal.Header>
        <Modal.Body>
          <>
            <div className="text-center">Bill Status</div>
            <BillHistoryTable billHistory={[history]} />
            <div className=" d-flex justify-content-center">
              <BillHistory bill={bill} billHistory={billHistory} />
            </div>
          </>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default BillStatus
