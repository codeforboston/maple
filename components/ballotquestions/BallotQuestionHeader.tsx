import Link from "next/link"
import { Container, Row, Col } from "react-bootstrap"
import { useAuth } from "../auth"
import { BallotQuestion, Bill } from "../db"
import { useFlags } from "../featureFlags"
import { FollowBallotQuestionButton } from "../shared/FollowButton"
import { DescriptionBox } from "./DescriptionBox"
import { getBallotQuestionStatusLabel } from "./status"
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
  const statusLabel = getBallotQuestionStatusLabel(ballotQuestion.ballotStatus)
  const questionLabel = ballotQuestion.ballotQuestionNumber
    ? `Question ${ballotQuestion.ballotQuestionNumber}`
    : `Question ${ballotQuestion.id}`
  const hasDescription = Boolean(ballotQuestion.description)

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
    <Container fluid="xl" className="mt-4">
      <div
        className="rounded-4 border px-4 py-4 px-lg-5 py-lg-5 shadow-sm"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 255, 1) 100%)",
          borderColor: "rgba(15, 23, 42, 0.08)",
          boxShadow: "0 0.75rem 2rem rgba(15, 23, 42, 0.07)"
        }}
      >
        <Row className="g-4 align-items-start">
          <Col lg={8}>
            <Link
              href="/ballotQuestions"
              className="ballot-question-back-link text-decoration-none small fw-semibold d-inline-flex align-items-center gap-2 mb-4"
            >
              <span aria-hidden="true">←</span>
              <span>Back to ballot questions</span>
            </Link>

            <div className="d-flex flex-wrap align-items-center gap-2 gap-lg-3 mb-3">
              <span
                className="d-inline-flex align-items-center gap-2 fw-semibold"
                style={{
                  color: "var(--bs-secondary)",
                  fontSize: "0.95rem",
                  lineHeight: 1.2
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: "0.6rem",
                    height: "0.6rem",
                    borderRadius: "999px",
                    backgroundColor: "var(--bs-secondary)",
                    boxShadow: "0 0 0 4px rgba(94, 114, 228, 0.12)"
                  }}
                />
                {statusLabel}
              </span>
              <span
                className="text-uppercase fw-semibold"
                style={{
                  fontSize: "0.8rem",
                  letterSpacing: "0.08em",
                  color: "#64748b"
                }}
              >
                {questionLabel}
              </span>
            </div>

            <h1
              className="mb-3 text-dark"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.1rem)",
                lineHeight: 1.08,
                fontWeight: 650,
                letterSpacing: "-0.02em",
                maxWidth: "20ch"
              }}
            >
              {bill?.content.Title || ballotQuestion.id}
            </h1>

            <div
              className="d-flex flex-wrap gap-2 gap-lg-3 mb-4"
              style={{ maxWidth: "42rem" }}
            >
              <MetaFact label="Type" value={getTypeLabel()} />
              <MetaFact
                label="Election"
                value={ballotQuestion.electionYear.toString()}
              />
              <MetaFact label="Court" value={ballotQuestion.court.toString()} />
              <MetaFact label="Document" value={ballotQuestion.id} />
            </div>
          </Col>

          <Col lg={4}>
            <div
              className="h-100 rounded-4 border p-4"
              style={{
                backgroundColor: "rgba(248, 250, 252, 0.92)",
                borderColor: "rgba(15, 23, 42, 0.08)"
              }}
            >
              <div
                className="text-uppercase fw-semibold mb-3"
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  color: "#64748b"
                }}
              >
                Take part
              </div>
              <div className="mb-3">
                {notifications && user && (
                  <FollowBallotQuestionButton ballotQuestion={ballotQuestion} />
                )}
              </div>
              <YourTestimonyPanel ballotQuestion={ballotQuestion} bill={bill} />
            </div>
          </Col>
        </Row>

        {(hasDescription || ballotQuestion.pdfUrl) && (
          <div>
            {ballotQuestion.description && (
              <DescriptionBox description={ballotQuestion.description} />
            )}

            {ballotQuestion.pdfUrl && (
              <a
                href={ballotQuestion.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ballot-question-pdf-link d-inline-flex align-items-center gap-2 rounded-pill border px-3 py-2 small text-decoration-none fw-semibold mt-3 mt-lg-0"
                style={{
                  color: "var(--bs-secondary)",
                  borderColor: "rgba(94, 114, 228, 0.18)",
                  backgroundColor: "rgba(255, 255, 255, 0.85)"
                }}
              >
                <span aria-hidden="true">↗</span>
                <span>Read petition PDF</span>
              </a>
            )}
          </div>
        )}
      </div>
    </Container>
  )
}

function MetaFact({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="d-flex flex-column"
      style={{
        minWidth: "6.5rem"
      }}
    >
      <span
        className="text-uppercase fw-semibold"
        style={{
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          color: "#64748b"
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: "#334155",
          fontSize: "1.05rem",
          fontWeight: 650,
          lineHeight: 1.3
        }}
      >
        {value}
      </span>
    </div>
  )
}
