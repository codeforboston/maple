import Link from "next/link"
import { Container, Row, Col } from "react-bootstrap"
import { useAuth } from "../auth"
import { BallotQuestion, Bill } from "../db"
import { useFlags } from "../featureFlags"
import { FollowBillButton } from "../shared/FollowButton"
import { DescriptionBox } from "./DescriptionBox"
import { YourTestimonyPanel } from "./YourTestimonyPanel"

export const BallotQuestionHeader = ({
  ballotQuestion,
  bill
}: {
  ballotQuestion: BallotQuestion
  bill: Bill | null
}) => {
  const { notifications } = useFlags()
  const { user } = useAuth()
  const questionLabel = ballotQuestion.ballotQuestionNumber
    ? `Question ${ballotQuestion.ballotQuestionNumber}`
    : `Question ${ballotQuestion.id}`

  const getTypeLabel = () => {
    switch (ballotQuestion.type) {
      case "initiative_statute":
        return "Law"
      case "initiative_constitutional":
        return "Constitutional Initiative"
      case "legislative_referral":
        return "Legislative Referral"
      case "constitutional_amendment":
        return "Constitutional Amendment"
      case "advisory":
        return "Advisory Question"
      default:
        return "Ballot Question"
    }
  }

  return (
    <Container className="mt-4" style={{ maxWidth: "1080px" }}>
      <div className="rounded border bg-white px-4 py-4 shadow-sm">
        <Row className="g-4 align-items-start">
          <Col lg={8}>
            <Link
              href="/ballotQuestions"
              className="text-decoration-none text-secondary small fw-semibold d-inline-block mb-4"
            >
              {"<<"} Return to ballot questions
            </Link>

            <div className="d-flex flex-wrap align-items-center gap-2 mb-1 small">
              <span className="fw-semibold text-secondary">
                {questionLabel}
              </span>
            </div>

            <div className="small text-body-secondary fst-italic mb-3">
              Type: {getTypeLabel()} <span className="fst-normal">ⓘ</span>
            </div>

            <h1
              className="mb-0 text-dark"
              style={{
                fontSize: "1.95rem",
                lineHeight: 1.24,
                fontWeight: 600,
                maxWidth: "39rem"
              }}
            >
              {bill?.content.Title || ballotQuestion.id}
            </h1>
          </Col>

          <Col lg={4}>
            <div className="border-start ps-lg-4 h-100">
              <div className="mb-3">
                {bill && notifications && user && <FollowBillButton bill={bill} />}
              </div>
              <YourTestimonyPanel ballotQuestion={ballotQuestion} bill={bill} />
            </div>
          </Col>
        </Row>

        <div className="border-top mt-4 pt-4">
          {ballotQuestion.description && (
            <DescriptionBox description={ballotQuestion.description} />
          )}

          <div className="d-flex flex-wrap gap-4 mt-4 small">
            {ballotQuestion.pdfUrl && (
              <a
                href={ballotQuestion.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none text-secondary fw-semibold"
              >
                View petition PDF
              </a>
            )}
            {bill && (
              <Link
                href={`/bills/${bill.court}/${bill.id}`}
                className="text-decoration-none text-secondary fw-semibold"
              >
                View bill ({bill.content.BillNumber})
              </Link>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}
