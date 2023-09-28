import { FC, useState } from "react"
import { Col, Container, Row } from "react-bootstrap"
import { BillTitle } from "./BillTitle"
import { PolicyActions } from "./PolicyActions"
import { useReportTestimony } from "components/api/report"
import { ReportModal } from "components/TestimonyCard/ReportModal"
import ReportToast from "components/TestimonyCard/ReportToast"
import { ToastContainer } from "react-bootstrap"
import { RevisionHistory } from "./RevisionHistory"
import { useCurrentTestimonyDetails } from "./testimonyDetailSlice"
import { TestimonyDetail } from "./TestimonyDetail"
import { VersionBanner } from "./TestimonyVersionBanner"
import { useAuth } from "components/auth"
import { useMediaQuery } from "usehooks-ts"

export const TestimonyDetailPage: FC = () => {
  const [isReporting, setIsReporting] = useState(false)
  const reportMutation = useReportTestimony()
  const didReport = reportMutation.isError || reportMutation.isSuccess
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { authorUid, revision } = useCurrentTestimonyDetails()
  const { user } = useAuth()
  const isUser = user?.uid === authorUid
  const handleReporting = (boolean: boolean) => {
    setIsReporting(boolean)
  }
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
              />
            )}
            <RevisionHistory />
          </Col>
          {/* Report Modal */}
          {isReporting && (
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
                "Personal Information",
                "Offensive",
                "Violent",
                "Spam",
                "Phishing"
              ]}
            />
          )}
          {/*  */}
        </Row>
        <ToastContainer position={"bottom-end"}>
          {didReport && <ReportToast isSuccessful={reportMutation.isSuccess} />}
        </ToastContainer>
      </Container>
    </>
  )
}
