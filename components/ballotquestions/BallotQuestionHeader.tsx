import { useTranslation } from "next-i18next"
import Link from "next/link"
import { Container, Row, Col } from "react-bootstrap"
import { useAuth } from "../auth"
import { BallotQuestion, Bill } from "../db"
import { useFlags } from "../featureFlags"
import { FollowBallotQuestionButton } from "../shared/FollowButton"
import { QuestionTooltip } from "../tooltip"
import { BallotQuestionAlert } from "./BallotQuestionAlert"
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
  const { t } = useTranslation(["common", "search"])
  const { notifications } = useFlags()
  const { user } = useAuth()
  const statusLabel = getBallotQuestionStatusLabel(ballotQuestion.ballotStatus)
  const questionNumberDisclaimer = t(
    "ballotQuestion.header.questionNumberDisclaimer",
    { ns: "common" }
  )
  const description = ballotQuestion.description
  const hasDescription = Boolean(description)

  const getTypeLabel = () => {
    switch (ballotQuestion.type) {
      case "initiative_statute":
        return t("ballotQuestion.types.law", { ns: "common" })
      case "initiative_constitutional":
        return t("ballotQuestion.types.constitutionalInitiative", {
          ns: "common"
        })
      case "legislative_referral":
        return t("ballotQuestion.types.legislativeReferral", { ns: "common" })
      case "constitutional_amendment":
        return t("ballotQuestion.types.constitutionalAmendment", {
          ns: "common"
        })
      case "advisory":
        return t("ballotQuestion.types.advisoryQuestion", { ns: "common" })
      case "referendum":
        return t("ballot_question_type.referendum", { ns: "search" })
      default:
        return t("ballotQuestion.types.default", { ns: "common" })
    }
  }

  return (
    <Container fluid="xl" className="mt-4">
      <div className="maple-surface-gradient rounded-4 px-4 py-4 px-lg-5 py-lg-5">
        <Row className="g-4 align-items-start">
          <Col lg={8}>
            <Link
              href="/ballotQuestions"
              className="maple-back-link text-decoration-none small fw-semibold d-inline-flex align-items-center gap-2 mb-4"
            >
              <span aria-hidden="true">←</span>
              <span>
                {t("ballotQuestion.header.backLink", { ns: "common" })}
              </span>
            </Link>

            <div className="d-flex flex-wrap align-items-center gap-2 gap-lg-3 mb-3">
              <span
                className="d-inline-flex align-items-center gap-2 fw-semibold"
                style={{
                  color: "var(--maple-brand-primary)",
                  fontSize: "0.95rem",
                  lineHeight: 1.2
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: "0.6rem",
                    height: "0.6rem",
                    borderRadius: "var(--maple-radius-pill)",
                    backgroundColor: "var(--maple-brand-primary)",
                    boxShadow: "0 0 0 4px var(--maple-surface-accent-strong)"
                  }}
                />
                {statusLabel}
              </span>
            </div>

            <h1
              className="mb-2 text-dark d-flex align-items-center gap-2"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.1rem)",
                lineHeight: 1.08,
                fontWeight: 650,
                letterSpacing: "-0.02em"
              }}
            >
              {t("ballotQuestion.header.question", { ns: "common" })}{" "}
              {ballotQuestion.ballotQuestionNumber != null ? (
                ballotQuestion.ballotQuestionNumber
              ) : (
                <>
                  #
                  <QuestionTooltip text={questionNumberDisclaimer} />
                </>
              )}
            </h1>

            <p
              className="mb-3 text-dark"
              style={{
                fontSize: "1.1rem",
                lineHeight: 1.4,
                maxWidth: "25ch"
              }}
            >
              {ballotQuestion.title || bill?.content.Title || ballotQuestion.id}
            </p>

            <BallotQuestionAlert
              alertFlag={ballotQuestion.alertFlag}
              alertTip={ballotQuestion.alertTip}
            />

            <div
              className="d-flex flex-wrap gap-2 gap-lg-3 mb-4 mt-3"
              style={{ maxWidth: "42rem" }}
            >
              <MetaFact
                label={t("ballotQuestion.header.type", { ns: "common" })}
                value={getTypeLabel()}
              />
              <MetaFact
                label={t("ballotQuestion.header.election", { ns: "common" })}
                value={ballotQuestion.electionYear.toString()}
              />
              <MetaFact
                label={t("ballotQuestion.header.court", { ns: "common" })}
                value={ballotQuestion.court.toString()}
              />
              <MetaFact
                label={t("ballotQuestion.header.document", { ns: "common" })}
                value={ballotQuestion.id}
              />
            </div>
          </Col>

          <Col lg={4}>
            <div className="h-100 maple-muted-surface rounded-4 p-4">
              <div className="maple-eyebrow mb-3">
                {t("ballotQuestion.header.takePart", { ns: "common" })}
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
          <div className="mt-4">
            {description && (
              <div className="mb-3">
                <DescriptionBox description={description} />
              </div>
            )}

            {ballotQuestion.pdfUrl && (
              <a
                href={ballotQuestion.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="maple-pill-link d-inline-flex align-items-center gap-2 rounded-pill border px-3 py-2 small text-decoration-none fw-semibold"
                style={{
                  color: "var(--maple-brand-primary)",
                  borderColor: "var(--maple-border-accent)",
                  backgroundColor: "var(--maple-surface-base)"
                }}
              >
                <span aria-hidden="true">↗</span>
                <span>
                  {t("ballotQuestion.header.readPetitionPdf", {
                    ns: "common"
                  })}
                </span>
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
      <span className="maple-eyebrow">{label}</span>
      <span
        style={{
          color: "var(--maple-text-body)",
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
