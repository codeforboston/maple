import { useTranslation } from "next-i18next"
import { FC, useState } from "react"
import { Col, Container, Row, ToastContainer } from "react-bootstrap"
import { BillTitle } from "./BillTitle"
import { PolicyActions } from "./PolicyActions"
import { useReportTestimony } from "components/api/report"
import {
  RequestDeleteOwnTestimonyModal,
  ReportModal
} from "components/TestimonyCard/ReportModal"
import ReportToast from "components/TestimonyCard/ReportToast"
import { RevisionHistory } from "./RevisionHistory"
import { useCurrentTestimonyDetails } from "./testimonyDetailSlice"
import { TestimonyDetail } from "./TestimonyDetail"
import { VersionBanner } from "./TestimonyVersionBanner"
import { useAuth } from "components/auth"
import { useMediaQuery } from "usehooks-ts"
import { setFollow, setUnfollow } from "components/shared/FollowingQueries"

export const TestimonyDetailPage: FC<React.PropsWithChildren<unknown>> = () => {
  const [isReporting, setIsReporting] = useState(false)
  const reportMutation = useReportTestimony()
  const didReport = reportMutation.isError || reportMutation.isSuccess
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { authorUid, revision } = useCurrentTestimonyDetails()
  const { bill } = useCurrentTestimonyDetails()
  const { user } = useAuth()
  const isUser = user?.uid === authorUid
  const handleReporting = (boolean: boolean) => {
    setIsReporting(boolean)
  }
  const { t } = useTranslation("testimony", { keyPrefix: "reportModal" })
  const uid = user?.uid
  const { id: billId, court: courtId } = bill
  const topicName = `bill-${courtId}-${billId}`
  const followAction = () =>
    setFollow(uid, topicName, bill, billId, courtId, undefined)
  const unfollowAction = () => setUnfollow(uid, topicName)

  return (
    <>
      <VersionBanner fluid="xl" />
      <Container className="mb-5" fluid="xl">
        <Row className="mt-4 mb-4">
          <BillTitle />
        </Row>

        <Row>
          <Col md={8}>
            <TestimonyDetail />
          </Col>

          <Col md={4}>
            {!isMobile && (
              <PolicyActions
                className="mb-4"
                isUser={isUser}
                isReporting={isReporting}
                setReporting={handleReporting}
                topicName={topicName}
                followAction={followAction}
                unfollowAction={unfollowAction}
              />
            )}
            <RevisionHistory />
          </Col>
          {/* Report Modal */}
          {isReporting &&
            (isUser ? (
              <RequestDeleteOwnTestimonyModal
                onClose={() => setIsReporting(false)}
                onReport={report => {
                  reportMutation.mutate({
                    report,
                    testimony: revision
                  })
                }}
                isLoading={reportMutation.isLoading}
              />
            ) : (
              <ReportModal
                onClose={() => setIsReporting(false)}
                onReport={report => {
                  reportMutation.mutate({
                    report,
                    testimony: revision
                  })
                }}
                isLoading={reportMutation.isLoading}
                additionalInformationLabel="Additional information:"
                reasons={[
                  t("personalInformation"),
                  t("offensive"),
                  t("violent"),
                  t("spam"),
                  t("phishing")
                ]}
              />
            ))}
          {/*  */}
        </Row>
        <ToastContainer position={"bottom-end"}>
          {didReport && <ReportToast isSuccessful={reportMutation.isSuccess} />}
        </ToastContainer>
      </Container>
    </>
  )
}
