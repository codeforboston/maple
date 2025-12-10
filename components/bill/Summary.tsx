import { doc, getDoc } from "firebase/firestore"
import { useTranslation } from "next-i18next"
import { useCallback, useEffect, useState } from "react"
import type { ModalProps } from "react-bootstrap"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { Button, Col, Container, Image, Modal, Row, Stack } from "../bootstrap"
import { useFlags } from "../featureFlags"
import { firestore } from "../firebase"
import * as links from "../links"
import {
  ButtonContainer,
  FeatureCalloutButton
} from "../shared/CommonComponents"
import { SmartDisclaimer } from "./SmartDisclaimer"
import { SmartIcon } from "./SmartIcon"
import { TestimonyCounts } from "./TestimonyCounts"
import { BillProps } from "./types"
import { BillTopic } from "functions/src/bills/types"
import { currentGeneralCourt } from "functions/src/shared"

const Divider = styled(Col)`
  width: 2px;
  padding: 0;
  background-color: var(--bs-blue-100);
  align-self: stretch;
`

const FormattedBillDetails = styled(Col)`
  white-space: pre-wrap;
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

const SmartTagButton = styled.button`
  border-radius: 12px;
  font-size: 12px;
`

const StyledButton = styled(Button)`
  :focus {
    box-shadow: none;
  }
  padding: 0;
  margin: 0;
`

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

export const ViewButton = styled.button`
  border-radius: 4px;
  border-width: 2px;
  height: fit-content;
  margin-top: 16px;
  width: fit-content;

  @media (max-width: 425px) {
    margin-top: 32px;
  }
`

export const ViewMessage = styled.div`
  width: 300px;

  @media (max-width: 425px) {
    width: auto;
  }
`

export const Summary = ({
  bill,
  className
}: BillProps & { className?: string }) => {
  const [showBillDetails, setShowBillDetails] = useState(false)
  const handleShowBillDetails = () => setShowBillDetails(true)
  const handleHideBillDetails = () => setShowBillDetails(false)
  const billText = bill?.content?.DocumentText
  const hearingIds = bill?.hearingIds

  const { showLLMFeatures } = useFlags()

  const { t } = useTranslation("common")
  const isMobile = useMediaQuery("(max-width: 991px)")

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

        {hearingIds ? (
          <>
            {isMobile ? (
              <div>
                <hr className={`m-0 border-bottom border-2`} />
              </div>
            ) : (
              <Divider className={`my-2`} xs="auto" />
            )}

            <Col className={`d-flex my-3`} xs="auto">
              <Stack>
                <Row className={`d-flex flex-nowrap`}>
                  <ButtonContainer className={`mb-2 pe-1`}>
                    <FeatureCalloutButton
                      className={`btn btn-secondary d-flex text-nowrap mt-1 mx-1 p-0`}
                    >
                      &nbsp; {t("new_feature")} &nbsp;
                    </FeatureCalloutButton>
                  </ButtonContainer>
                  <div className={`d-flex justify-content-start ps-0`}>
                    {t("bill.hearing_video_and_transcript", { ns: "common" })}
                  </div>
                </Row>
                <ViewMessage>
                  {t("view_the_hearing", { ns: "common" })}
                </ViewMessage>
              </Stack>
              <Stack className={`ms-3`}>
                <ButtonContainer className={`d-flex align-self-center`}>
                  <ViewChild bill={bill} />
                </ButtonContainer>
              </Stack>
            </Col>
          </>
        ) : (
          <></>
        )}
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

const ViewChild = ({ bill }: BillProps) => {
  const { t } = useTranslation("common")
  const hearingIds = bill.hearingIds

  const [hearingsModal, setHearingsModal] = useState<"show" | null>(null)

  const close = () => setHearingsModal(null)

  return (
    <>
      {hearingIds?.length === 1 ? (
        <links.Internal href={`/hearing/${hearingIds}`} className="">
          <ViewButton className={`btn btn-outline-secondary fw-bold p-1`}>
            {t("view", { ns: "common" })}
          </ViewButton>
        </links.Internal>
      ) : (
        <ViewButton
          className={`btn btn-outline-secondary fw-bold p-1`}
          onClick={() => setHearingsModal("show")}
        >
          {t("view", { ns: "common" })}
        </ViewButton>
      )}
      <HearingsModal
        hearingIds={hearingIds}
        onHide={close}
        onHearingsModalClose={() => setHearingsModal(null)}
        show={hearingsModal === "show"}
      />
    </>
  )
}

type Props = Pick<ModalProps, "show" | "onHide"> & {
  hearingIds: string[] | undefined
  onHearingsModalClose: () => void
}

function HearingsModal({
  hearingIds,
  onHide,
  onHearingsModalClose,
  show
}: Props) {
  const { t } = useTranslation(["common"])

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="hearings-modal"
      centered
    >
      <Modal.Header className={`px-3 py-1`}>
        <Modal.Title id="hearings-modal">
          <b>{t("bill.select_hearing", { ns: "common" })}</b>
        </Modal.Title>
        <Image
          src="/x_cancel.png"
          alt={t("navigation.closeNavMenu", { ns: "editProfile" })}
          width="25"
          height="25"
          className="ms-2"
          onClick={onHearingsModalClose}
        />
      </Modal.Header>
      <Modal.Body className={`bg-white p-3`}>
        <hr className={`m-0 border-bottom border-2`} />
        <p className={`fw-bold fs-6`}>
          {t("bill.multiple_hearings", { ns: "common" })}
        </p>
        {hearingIds?.map((element: any, index: number) => (
          <Hearing key={index} hearingId={element} />
        ))}
      </Modal.Body>
    </Modal>
  )
}

const HearingRow = styled.div`
  &:nth-child(odd) {
    background-color: #eae7e7;
  &:nth-child(even) {
    background-color: white;
  }
`

function Hearing({ hearingId }: { hearingId: string }) {
  const [committeeCode, setCommitteeCode] = useState("")
  const [committeeName, setCommitteeName] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [generalCourtNumber, setGeneralCourtNumber] = useState("")

  const hearingData = useCallback(async () => {
    const hearing = await getDoc(doc(firestore, `events/${hearingId}`))
    const docData = hearing.data()

    setCommitteeCode(docData?.content.HearingHost.CommitteeCode)
    setCommitteeName(docData?.content.Name)
    setEventDate(docData?.content.EventDate)
    setGeneralCourtNumber(docData?.content.HearingHost.GeneralCourtNumber)
  }, [hearingId])

  useEffect(() => {
    hearingId ? hearingData() : null
  }, [])

  const [branch, setBranch] = useState("")

  const committeeData = useCallback(async () => {
    const committee = await getDoc(
      doc(
        firestore,
        `generalCourts/${generalCourtNumber}/committees/${committeeCode}`
      )
    )
    const docData = committee.data()
    setBranch(docData?.content?.Branch)
  }, [committeeCode, generalCourtNumber])

  useEffect(() => {
    committeeCode && generalCourtNumber ? committeeData() : null
  }, [committeeCode, committeeData, generalCourtNumber])

  const date = new Date(eventDate)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const year = date.getFullYear()

  return (
    <HearingRow className={`d-flex justify-content-between w-auto`}>
      <Col xs={3} className={`mx-2`}>
        {`${month}-${day}-${year}`}
      </Col>
      <Col xs={7} className={`me-2`}>
        <links.Internal href={`/hearing/${hearingId}`}>
          {committeeName}
        </links.Internal>
      </Col>
      <Col xs={2} className={``}>
        {branch}
      </Col>
    </HearingRow>
  )
}
