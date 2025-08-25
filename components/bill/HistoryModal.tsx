import { useState } from "react"
import styled from "styled-components"
import { Button, Modal } from "../bootstrap"
import { HistoryTable } from "./HistoryTable"
import { BillProps } from "./types"
import { useTranslation } from "next-i18next"

export const HistoryModal = ({ bill }: BillProps) => {
  const [showBillHistory, setShowBillHistory] = useState(false)
  const handleShowBillHistory = () => setShowBillHistory(true)
  const handleCloseBillHistory = () => setShowBillHistory(false)
  const { t } = useTranslation("common")

  return (
    <>
      <Button variant="primary" className="m-1" onClick={handleShowBillHistory}>
        {t("bill.history")}
      </Button>
      <Modal show={showBillHistory} onHide={handleCloseBillHistory} size="lg">
        <Modal.Header closeButton onClick={handleCloseBillHistory}>
          <StyledModalTitle>{t("bill.status_and_history")}</StyledModalTitle>
        </Modal.Header>
        <StyledBillTitle>
          {bill.id + " - " + bill.content.Title}
        </StyledBillTitle>
        <Modal.Body>
          <HistoryTable billHistory={bill.history} />
        </Modal.Body>
      </Modal>
    </>
  )
}

export const StyledModalTitle = styled(Modal.Title)`
  font-size: 40px;
  font-weight: 700;
  line-height: 55px;
  letter-spacing: -1.5px;
  text-align: justified;
`

export const StyledBillTitle = styled.div`
  font-size: 32px;
  font-weight: 600;
  line-height: 44px;
  letter-spacing: -1.5px;
  text-align: justified;
  margin: 1rem 2rem 0 2rem;
`
