import { useState } from "react"
import { Button, Modal } from "../bootstrap"
import { HistoryTable } from "./HistoryTable"
import { BillProps } from "./types"

export const HistoryModal = ({ bill }: BillProps) => {
  const [showBillHistory, setShowBillHistory] = useState(false)

  const handleShowBillHistory = () => setShowBillHistory(true)
  const handleCloseBillHistory = () => setShowBillHistory(false)
  return (
    <>
      <Button variant="primary" className="m-1" onClick={handleShowBillHistory}>
        History
      </Button>
      <Modal show={showBillHistory} onHide={handleCloseBillHistory} size="lg">
        <Modal.Header closeButton onClick={handleCloseBillHistory}>
          <Modal.Title>{bill.id + " - " + bill.content.Title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <HistoryTable billHistory={bill.history} />
        </Modal.Body>
      </Modal>
    </>
  )
}
