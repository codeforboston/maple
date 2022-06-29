import { last } from "lodash"
import { useState } from "react"
import styled from "styled-components"
import { Button, Modal } from "../bootstrap"
import { BillHistory } from "./BillHistory"
import { BillHistoryTable } from "./BillHistoryTable"
import { BillProps } from "./types"

const StyledButton = styled(Button)`
  border-radius: 3rem 0 0 3rem;
  font-size: 2rem;
  line-height: 2.5rem;
  max-width: 100%;
`

export const BillStatus = ({ bill }: BillProps) => {
  const [showBillStatus, setShowBillStatus] = useState(false)

  const handleShowBillStatus = () => setShowBillStatus(true)
  const handleCloseBillStatus = () => setShowBillStatus(false)
  const history = last(bill.history)

  if (!history) return null
  return (
    <>
      <StyledButton
        variant="secondary"
        className="m-1 text-truncate"
        onClick={handleShowBillStatus}
      >
        {history.Action}
      </StyledButton>
      <Modal show={showBillStatus} onHide={handleCloseBillStatus} size="lg">
        <Modal.Header closeButton onClick={handleCloseBillStatus}>
          {bill ? bill.id + " - " + bill.content.Title : ""}
        </Modal.Header>
        <Modal.Body>
          <>
            <div className="text-center">Bill Status</div>
            <BillHistoryTable billHistory={[history]} />
            <div className=" d-flex justify-content-center">
              <BillHistory bill={bill} />
            </div>
          </>
        </Modal.Body>
      </Modal>
    </>
  )
}
