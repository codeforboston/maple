import * as links from "components/links"
import { useTranslation } from "next-i18next"
import { useState } from "react"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Button, Col, Container, Modal, Row } from "../bootstrap"
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

const SmartTagDesc = styled(Row)`
  font-size: 12px;
`

export const Summary = ({
  bill,
  className
}: BillProps & { className?: string }) => {
  const [showBillDetails, setShowBillDetails] = useState(false)
  const handleShowBillDetails = () => setShowBillDetails(true)
  const handleHideBillDetails = () => setShowBillDetails(false)
  const billText = bill?.content?.DocumentText

  const isMobile = useMediaQuery("(max-width: 768px)")
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
      <hr className={`m-0 border-bottom border-2`} />
      {isMobile ? (
        <div className={`mx-2`}>
          <div className={`d-flex justify-content-center`}>
            <Image
              src="/smart-tag.png"
              alt={t("bill.smart-tag")}
              // className={`d-flex justify-self-center`}
              // height="53"
              // width="38"
            />
          </div>
          <Row className={`fs-5 fw-bold`}>{t("bill.smart_summary")}</Row>
          <SmartTagDesc>{t("bill.smart_explanation")}</SmartTagDesc>
        </div>
      ) : (
        <Row className={`d-flex my-3`} xs="auto">
          <Col>
            <Image
              src="/smart-tag.png"
              alt={t("bill.smart-tag")}
              className={``}
            />
          </Col>
          <Col className={`mt-1`} xs="10">
            <Row className={`fs-5 fw-bold`}>{t("bill.smart_summary")}</Row>
            <SmartTagDesc>{t("bill.smart_explanation")}</SmartTagDesc>
          </Col>
        </Row>
      )}
    </SummaryContainer>
  )
}
