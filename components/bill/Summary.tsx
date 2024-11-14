import { useFlags } from "components/featureFlags"
import * as links from "components/links"
import { useTranslation } from "next-i18next"
import { useState } from "react"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Button, Col, Container, Modal, Row } from "../bootstrap"
import { SmartDisclaimer } from "./SmartDisclaimer"
import { TestimonyCounts } from "./TestimonyCounts"
import { BillProps } from "./types"

const SummaryContainer = styled(Container)`
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
  background-image: url("/quote-left.svg");
  background-repeat: no-repeat;
  background-size: 4rem;
  background-position: 0.5rem 0.5rem;
`

const TitleFormat = styled(Col)`
  margin-top: 1rem;
  font-style: italic;
  font-size: 1.25rem;
`

const Divider = styled(Col)`
  width: 2px;
  padding: 0;
  background-color: var(--bs-blue-100);
  align-self: stretch;
`

const StyledButton = styled(Button)`
  :focus {
    box-shadow: none;
  }
  padding: 0;
  margin: 0;
`

const FormattedBillDetails = styled(Col)`
  white-space: pre-wrap;
`

export const Summary = ({
  bill,
  className
}: BillProps & { className?: string }) => {
  const [showBillDetails, setShowBillDetails] = useState(false)
  const handleShowBillDetails = () => setShowBillDetails(true)
  const handleHideBillDetails = () => setShowBillDetails(false)
  const billText = bill?.content?.DocumentText

  const { showLLMFeatures } = useFlags()

  const { t } = useTranslation("common")

  console.log("Bill: ", bill)

  return (
    <SummaryContainer className={className}>
      <Row>
        <TitleFormat>
          {bill.content.Title}
          <div className="d-flex justify-content-end">
            {billText ? (
              <StyledButton
                variant="link"
                className="m-1"
                onClick={handleShowBillDetails}
              >
                {t("bill.read_more")}
              </StyledButton>
            ) : (
              <links.External
                className="fst-normal fs-body"
                href={links.billPdfUrl(bill.court, bill.id)}
              >
                {t("bill.download_pdf")}
              </links.External>
            )}
          </div>

          <Modal
            show={showBillDetails}
            onHide={handleHideBillDetails}
            size="lg"
          >
            <Modal.Header closeButton onClick={handleHideBillDetails}>
              <Modal.Title>{bill?.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-white">
              <FormattedBillDetails>
                {bill?.content?.DocumentText}
              </FormattedBillDetails>
            </Modal.Body>
          </Modal>
        </TitleFormat>

        <Divider className={`my-2`} xs="auto" />
        <Col className={`d-flex`} xs="auto">
          <TestimonyCounts bill={bill} />
        </Col>
      </Row>
      {showLLMFeatures ? (
        <>
          <hr className={`m-0 border-bottom border-2`} />
          <SmartDisclaimer />
          <Row className="fst-italic mx-2">{bill.summary}</Row>
        </>
      ) : (
        <></>
      )}
    </SummaryContainer>
  )
}
