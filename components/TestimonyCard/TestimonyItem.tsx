import { formUrl } from "components/publish/hooks"
import Image from "react-bootstrap/Image"
import { ToastContainer } from "react-bootstrap"
import { useReportTestimony } from "components/api/report"
import ReportToast from "./ReportToast"
import { useMediaQuery } from "usehooks-ts"
import { usePublishService } from "components/publish/hooks"
import { Col, Row, Stack, Button, Spinner } from "../bootstrap"
import styled from "styled-components"
import { Testimony } from "../db"
import { Internal, maple } from "../links"
import { UserInfoHeader } from "./UserInfoHeader"
import { BillInfoHeader } from "./BillInfoHeader"
import { ReportModal } from "./ReportModal"
import { useState } from "react"
import { TestimonyContent } from "components/testimony"
import { ViewAttachment } from "components/ViewAttachment"
import styles from "./ViewTestimony.module.css"
import { UseAsyncReturn } from "react-async-hook"

const FooterButton = styled(Button)`
  margin: 0;
  padding: 0;
  text-decoration: none;
`
const StyledCol = styled(Col)`
  font-size: 0.75rem;

  .choice {
    padding: 0.2rem 0.5rem 0.2rem 0.5rem;
    border-radius: 0.75rem;
    color: white;
    margin: 0;
    font-size: 0.75rem;

    align-items: center;
  }
`

const ArchiveTestimonyConfirmation = ({
  show,
  onHide,
  archiveTestimony
}: {
  show: boolean
  onHide: () => void
  archiveTestimony: UseAsyncReturn<void, []> | undefined
}) => {
  return (
    <>
      <StyledCol>Are you sure you want to delete your testimony?</StyledCol>
      <StyledCol>
        <Button
          className="choice me-4"
          variant="secondary"
          onClick={archiveTestimony?.execute}
          disabled={archiveTestimony === undefined || archiveTestimony.loading}
        >
          {archiveTestimony?.loading ? (
            <Spinner size="sm" animation="border" />
          ) : (
            "Yes"
          )}
        </Button>
        <Button className="choice" variant="primary" onClick={onHide}>
          No
        </Button>
      </StyledCol>
    </>
  )
}

export const TestimonyItem = ({
  testimony,
  isUser,
  canEdit,
  canDelete,
  onProfilePage
}: {
  testimony: Testimony
  isUser: boolean
  canEdit?: boolean
  canDelete?: boolean
  onProfilePage: boolean
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const publishedDate = testimony.publishedAt
    ? testimony.publishedAt.toDate().toLocaleDateString()
    : ""

  const billLink = maple.bill({
    id: testimony.billId,
    court: testimony.court
  })

  const [isReporting, setIsReporting] = useState(false)
  const reportMutation = useReportTestimony()
  const didReport = reportMutation.isError || reportMutation.isSuccess

  const testimonyContent = testimony.content

  const snippetChars = 500
  const [showAllTestimony, setShowAllTestimony] = useState(false)
  const snippet = showAllTestimony
    ? testimonyContent
    : testimonyContent.slice(0, snippetChars)
  const canExpand = snippet.length !== testimonyContent.length

  const [showConfirm, setShowConfirm] = useState(false)
  const { deleteTestimony } = usePublishService() ?? {}

  return (
    <div
      className={onProfilePage ? styles.bottomborder : styles.nobottomborder}
    >
      <div className={`border-0 h5 d-flex`}>
        {isMobile && isUser && (
          <>
            <Internal
              className={styles.link}
              href={formUrl(testimony.billId, testimony.court)}
            >
              <Image
                className="px-2 ms-auto align-self-center"
                src="/edit-testimony.svg"
                alt="Edit icon"
                height={50}
                width={50}
              />
            </Internal>
            {/**
             * visually-hidden until delete is ready at a later stage
             */}
            <Internal
              className={`styles.link, visually-hidden`}
              href={billLink}
            >
              <Image
                className="px-2 align-self-center"
                src="/delete-testimony.svg"
                alt="Delete testimony icon"
                height={50}
                width={50}
              />
            </Internal>
          </>
        )}
      </div>
      <Stack gap={1}>
        <Row className={`justify-content-between align-items-center`}>
          {onProfilePage ? (
            <BillInfoHeader
              testimony={testimony}
              billLink={billLink}
              publishedDate={publishedDate}
            />
          ) : (
            <UserInfoHeader
              testimony={testimony}
              billLink={billLink}
              publishedDate={publishedDate}
            />
          )}
        </Row>
        <Row className={`col m2`}>
          <TestimonyContent className="col m2" testimony={snippet} />
        </Row>
        <Row xs="auto" className={`d-flex align-items-center`}>
          {canExpand && (
            <Col className="justify-content-end d-flex">
              <FooterButton
                variant="link"
                onClick={() => setShowAllTestimony(true)}
              >
                Expand
              </FooterButton>
            </Col>
          )}

          <Col>
            <FooterButton variant="link">
              <Internal
                className={styles.link}
                href={maple.testimony({ publishedId: testimony.id })}
              >
                More Details
              </Internal>
            </FooterButton>
          </Col>

          <Col className="justify-content-end d-flex">
            <FooterButton variant="link">
              <ViewAttachment testimony={testimony} />
            </FooterButton>
          </Col>

          {isUser ? (
            <>
              {onProfilePage && (
                <Col>
                  <FooterButton variant="link">
                    <Internal
                      className={styles.link2}
                      href={formUrl(testimony.billId, testimony.court)}
                    >
                      Edit
                    </Internal>
                  </FooterButton>
                </Col>
              )}

              {canDelete && (
                <>
                  <Col>
                    <FooterButton
                      style={{ color: "#c71e32" }}
                      onClick={() => setShowConfirm(s => !s)}
                      variant="link"
                    >
                      Rescind
                    </FooterButton>
                  </Col>

                  {showConfirm && (
                    <ArchiveTestimonyConfirmation
                      show={showConfirm}
                      onHide={() => setShowConfirm(false)}
                      archiveTestimony={deleteTestimony}
                    />
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {/* hiding for soft launch
              <Col xs="auto">
                <FooterButton
                  variant="link"
                  onClick={() => setIsReporting(true)}
                >
                  Report
                </FooterButton>
              </Col> */}
            </>
          )}
        </Row>
      </Stack>

      {isReporting && (
        <ReportModal
          onClose={() => setIsReporting(false)}
          onReport={report => {
            reportMutation.mutate({ report, testimony })
          }}
          isLoading={reportMutation.isLoading}
          reasons={[
            "Personal Information",
            "Offensive",
            "Violent",
            "Spam",
            "Phishing"
          ]}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
          pointerEvents: "none"
        }}
      >
        <ToastContainer position={"bottom-end"}>
          {didReport && <ReportToast isSuccessful={reportMutation.isSuccess} />}
        </ToastContainer>
      </div>
    </div>
  )
}
