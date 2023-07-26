import { last } from "lodash"
import { useState, createContext } from "react"
import styled from "styled-components"
import { Button, Modal } from "../bootstrap"
import { StyledBillTitle, StyledModalTitle } from "./HistoryModal"
import { HistoryTable } from "./HistoryTable"
import { BillProps } from "./types"

const StyledButton = styled(Button)`
  border-radius: 3rem 0 0 3rem;
  font-size: 1.5rem;
  line-height: 1.5rem;
  max-width: 100%;
`

export const CourtContext = createContext(1)

export const Status = ({ bill }: BillProps) => {
  const [showBillHistory, setShowBillHistory] = useState(false)

  const handleShowBillHistory = () => setShowBillHistory(true)
  const handleCloseBillHistory = () => setShowBillHistory(false)
  const history = last(bill.history)

  if (!history) return null
  return (
    <>
      <CourtContext.Provider value={bill.court}>
        <StyledButton
          variant="secondary"
          className="text-truncate ps-4"
          onClick={handleShowBillHistory}
        >
          {history.Action}
        </StyledButton>
        <Modal show={showBillHistory} onHide={handleCloseBillHistory} size="lg">
          <Modal.Header closeButton onClick={handleCloseBillHistory}>
            <StyledModalTitle>Status & History</StyledModalTitle>
          </Modal.Header>
          <StyledBillTitle>
            {bill.id + " - " + bill.content.Title}
          </StyledBillTitle>
          <Modal.Body>
            <HistoryTable billHistory={bill.history} />
          </Modal.Body>
        </Modal>
      </CourtContext.Provider>
    </>
  )
}
