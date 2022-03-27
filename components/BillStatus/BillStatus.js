import React, { useState } from "react"
import { Button, Modal } from "react-bootstrap"
import BillHistory from "../BillHistory/BillHistory"
import BillHistoryTable from "../BillHistoryTable/BillHistoryTable"

const BillStatus = ({ bill, billHistory }) => {
  const [showBillStatus, setShowBillStatus] = useState(false)

  const handleShowBillStatus = () => setShowBillStatus(true)
  const handleCloseBillStatus = () => setShowBillStatus(false)

  return (
    <>
      <Button variant="primary" className="m-1" onClick={handleShowBillStatus}>
        Status
      </Button>
      <Modal show={showBillStatus} onHide={handleCloseBillStatus} size="lg">
        <Modal.Header closeButton onClick={handleCloseBillStatus}>
          {bill ? bill.BillNumber + " - " + bill.Title : ""}
        </Modal.Header>
        <Modal.Body>
          <>
            <div className="text-center">Bill Status</div>

            {/* most recent history item */}
            <BillHistoryTable
              billHistory={[billHistory[billHistory.length - 1]]}
            />

            {/* history button  */}
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
