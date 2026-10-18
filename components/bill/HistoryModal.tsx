import { useState } from "react"
import styled from "styled-components"
import { Button, Modal } from "../bootstrap"
import { HistoryTable } from "./HistoryTable"
import { BillProps } from "./types"
import { useTranslation } from "next-i18next"
import { formatBillId } from "../formatting"

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
        <BillHistoryHeading bill={bill} />
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

  /* Digital Democracy and Mixed: in the skin's Lexend, which headings like
     this one do not otherwise pick up, at normal letter spacing. */
  [data-maple-theme="dd"] & {
    font-family: var(--maple-font-heading);
    letter-spacing: normal;
  }
`

/** The bill named under the modal title, shared by every Status & History
 * modal (here and components/bill/Status.tsx). */
export const BillHistoryHeading = ({ bill }: BillProps) => (
  <>
    <StyledBillTitle>{bill.id + " - " + bill.content.Title}</StyledBillTitle>
    <BillHeading>
      <p className="number">{formatBillId(bill.id)}</p>
      <p className="title">{bill.content.Title}</p>
    </BillHeading>
  </>
)

export const StyledBillTitle = styled.div`
  font-size: 32px;
  font-weight: 600;
  line-height: 44px;
  letter-spacing: -1.5px;
  text-align: justified;
  margin: 1rem 2rem 0 2rem;

  [data-maple-theme="dd"] & {
    display: none;
  }
`

/* Digital Democracy and Mixed: the bill named the way the page behind the
   modal names it, the number as on the page (H.5004) over the title in the
   summary card's italic. Replaces StyledBillTitle above. */
const BillHeading = styled.div`
  display: none;
  margin: 1.25rem 2rem 0;

  [data-maple-theme="dd"] & {
    display: block;
  }

  .number {
    color: var(--bs-blue);
    font-size: 2.25rem;
    font-weight: 500;
    line-height: 1.1;
    margin-bottom: 0.25rem;
  }

  .title {
    font-size: 1.25rem;
    font-style: italic;
    margin-bottom: 0;
  }
`
