import { useFlags } from "components/featureFlags"
import * as links from "components/links"
import { useTranslation } from "next-i18next"
import { useState } from "react"
import styled from "styled-components"
import { Button, Col, Container, Modal, Row } from "../bootstrap"
import { SmartDisclaimer } from "./SmartDisclaimer"
import { SmartIcon } from "./SmartIcon"
import { TestimonyCounts } from "./TestimonyCounts"
import { BillProps } from "./types"
import { currentGeneralCourt } from "common/constants"
import { BillTopic } from "functions/src/bills/types"

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

const SmartTagButton = styled.button`
  border-radius: 12px;
  font-size: 12px;
`

const SmartTag = ({ topic }: { topic: BillTopic }) => {
  return (
    <links.Internal
      href={links.billSearchByTopicLink(currentGeneralCourt, topic)}
    >
      <SmartTagButton
        className={`btn btn-secondary d-flex text-nowrap mt-1 mx-1 p-1`}
      >
        &nbsp;
        <SmartIcon icon={topic.category} />
        &nbsp;
        {topic.topic}
        &nbsp;
      </SmartTagButton>
    </links.Internal>
  )
}

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
                {t("bill.view_bill")}
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
          {bill.summary !== undefined && bill.topics !== undefined ? (
            <>
              <hr className={`m-0 border-bottom border-2`} />
              <SmartDisclaimer />
            </>
          ) : (
            <></>
          )}
          <Row className="mx-1 mb-3">{bill.summary}</Row>
          <Row className={`d-flex mx-0 my-1`} xs="auto">
            {bill.topics?.map(t => (
              <SmartTag key={t.topic} topic={t} />
            ))}
          </Row>
        </>
      ) : (
        <></>
      )}
    </SummaryContainer>
  )
}
