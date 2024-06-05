import { useTranslation } from "next-i18next"
import { ReactNode, useState } from "react"
import { ButtonProps } from "react-admin"
import { ToastContainer } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import { useMediaQuery } from "usehooks-ts"

import { useReportTestimony } from "components/api/report"
import { formUrl } from "components/publish/hooks"
import { TestimonyContent } from "components/testimony"
import { trimContent } from "components/TestimonyCallout/TestimonyCallout"
import { ViewAttachment } from "components/ViewAttachment"
import { Button, Col, Row, Stack } from "../bootstrap"
import { Testimony } from "../db"
import { Internal, maple } from "../links"
import { BillInfoHeader } from "./BillInfoHeader"
import { ReportModal, RequestDeleteOwnTestimonyModal } from "./ReportModal"
import ReportToast from "./ReportToast"
import { UserInfoHeader } from "./UserInfoHeader"

type FooterButtonProps = Omit<ButtonProps, "children"> & {
  className?: string
  children?: ReactNode
}

const FooterButton = ({
  variant = "text",
  className,
  children
}: FooterButtonProps) => {
  return (
    <Button
      className={`text-decoration-none m-0 p-0 ${className}`}
      variant={variant}
    >
      {children}
    </Button>
  )
}

export const TestimonyItem = ({
  testimony,
  isUser,
  onProfilePage
}: {
  testimony: Testimony
  isUser: boolean
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

  const testimonyContent =
    testimony.content ??
    "This draft has no content. Click Edit to add your testimony."

  const snippetChars = 500
  const [showAllTestimony, setShowAllTestimony] = useState(false)
  const snippet = showAllTestimony
    ? testimonyContent
    : trimContent(testimonyContent.slice(0, snippetChars), snippetChars)
  const canExpand = snippet.length !== testimonyContent.length

  const { t } = useTranslation("testimony")

  const IconSpacer = () => {
    /* this image does not appear to display anything,      *
     * however it acts as a spacing element                 *
     *                                                      *
     * removing this image will throw off the alignment vs  *
     * the nearby elements that contain visible icons      */

    return (
      <Image
        className="ms-auto align-self-center"
        src="/edit-testimony.svg"
        alt=""
        height={40}
        width={0}
      />
    )
  }

  return (
    <div className={`py-3 px-2 ${onProfilePage && "border-bottom border-2"}`}>
      <div className={`border-0 h5 d-flex`}>
        {isMobile && isUser && (
          <>
            <Internal
              className={`text-decoration-none`}
              href={formUrl(testimony.billId, testimony.court)}
            >
              <Image
                className="px-2 ms-auto align-self-center"
                src="/edit-testimony.svg"
                alt={t("testimonyItem.editIcon") ?? "Edit icon"}
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
                variant="text"
                onClick={() => setShowAllTestimony(true)}
              >
                {t("testimonyItem.expand")}
                <IconSpacer />
              </FooterButton>
            </Col>
          )}
          {testimony.id && (
            <Col>
              <FooterButton variant="text">
                <Internal
                  className={`text-decoration-none`}
                  href={maple.testimony({ publishedId: testimony.id })}
                >
                  {t("testimonyItem.moreDetails")}
                  <IconSpacer />
                </Internal>
              </FooterButton>
            </Col>
          )}
          {testimony.attachmentId && (
            <Col className="d-flex">
              <FooterButton variant="text">
                <ViewAttachment testimony={testimony} />

                {/* Current bug Issue #1564 makes this instance of IconSpacer hard to test *
                 * Please revisit once #1564 is resolved                                  */}
                <IconSpacer />
              </FooterButton>
            </Col>
          )}
          <Col xs="auto">
            <FooterButton variant="text" onClick={() => setIsReporting(true)}>
              Report
              <IconSpacer />
            </FooterButton>
          </Col>
          {isUser && !isMobile && (
            <Col>
              <FooterButton variant="text">
                <Internal
                  className={`text-decoration-none text-secondary`}
                  href={formUrl(testimony.billId, testimony.court)}
                >
                  Edit
                  <Image
                    className="px-2 ms-auto align-self-center"
                    src="/edit-testimony.svg"
                    alt={t("testimonyItem.editIcon") ?? "Edit icon"}
                    height={40}
                    width={40}
                  />
                </Internal>
              </FooterButton>
            </Col>
          )}
        </Row>
      </Stack>

      {isReporting &&
        (isUser ? (
          <RequestDeleteOwnTestimonyModal
            onClose={() => setIsReporting(false)}
            onReport={report => reportMutation.mutate({ report, testimony })}
            isLoading={reportMutation.isLoading}
          />
        ) : (
          <ReportModal
            onClose={() => setIsReporting(false)}
            onReport={report => {
              reportMutation.mutate({ report, testimony })
            }}
            isLoading={reportMutation.isLoading}
            additionalInformationLabel="Additional information:"
            reasons={[
              t("reportModal.personalInformation"),
              t("reportModal.offensive"),
              t("reportModal.violent"),
              t("reportModal.spam"),
              t("reportModal.phishing")
            ]}
          />
        ))}
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
        <ToastContainer position={"top-center"} style={{ zIndex: 1 }}>
          {didReport && <ReportToast isSuccessful={reportMutation.isSuccess} />}
        </ToastContainer>
      </div>
    </div>
  )
}
