import { Trans, useTranslation } from "next-i18next"
import type { ReactNode } from "react"
import { Col, Row } from "react-bootstrap"
import { BallotQuestion, Bill } from "../db"
import { QuestionTooltip } from "../tooltip"
import { CommitteeHearing } from "./CommitteeHearing"
import { Hearing } from "./types"

export const OverviewTab = ({
  ballotQuestion,
  bill,
  hearings
}: {
  ballotQuestion: BallotQuestion
  bill: Bill | null
  hearings: Hearing[]
}) => {
  const { t } = useTranslation(["common", "search"])
  const sortedHearings = [...hearings].sort((a, b) => b.startsAt - a.startsAt)
  const sectionCopyStyle = {
    color: "var(--maple-text-body)",
    fontSize: "0.98rem",
    lineHeight: 1.8,
    maxWidth: "75ch"
  } as const

  return (
    <div className="d-grid gap-4">
      <SectionCard>
        <div className="d-flex align-items-start gap-3 mb-0">
          <div
            className="maple-icon-chip rounded-4 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: "3rem",
              height: "3rem"
            }}
          >
            <BallotGlyph />
          </div>
          <div>
            <h2 className="h4 mb-1 text-secondary">
              {t("ballotQuestion.overview.title", { ns: "common" })}
            </h2>
            <p className="text-body-secondary small mb-0">
              {t("ballotQuestion.overview.description", { ns: "common" })}
            </p>
          </div>
        </div>
      </SectionCard>

      {ballotQuestion.type === "referendum" && (
        <SectionCard>
          <h3 className="h5 mb-2 text-dark">
            {t("ballot_question_referendum_how_vote_works.title")}
          </h3>
          <p className="mb-0" style={sectionCopyStyle}>
            <Trans
              i18nKey="ballot_question_referendum_how_vote_works.body"
              ns="search"
              components={[<strong key="yes" />, <strong key="no" />]}
            />
          </p>
        </SectionCard>
      )}

      {ballotQuestion.atAGlance && ballotQuestion.atAGlance.length > 0 && (
        <SectionCard>
          <h3 className="h5 mb-3 text-dark">
            {t("ballotQuestion.overview.keyDetails", { ns: "common" })}
          </h3>
          <Row className="g-3">
            {ballotQuestion.atAGlance.map((item, idx) => (
              <Col key={idx} md={6}>
                <div className="maple-muted-surface rounded-4 h-100 px-3 py-3">
                  <div className="maple-eyebrow mb-2">{item.label}</div>
                  <div
                    style={{
                      color: "var(--maple-text-strong)",
                      fontSize: "0.98rem",
                      lineHeight: 1.5
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </SectionCard>
      )}

      {ballotQuestion.fullSummary && (
        <SectionCard>
          <h3 className="h5 mb-3 text-dark d-flex align-items-center gap-1">
            {t("ballotQuestion.overview.officialSummary", { ns: "common" })}
            <QuestionTooltip
              text={t("ballotQuestion.overview.officialSummaryTooltip", {
                ns: "common"
              })}
            />
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {ballotQuestion.fullSummary.split(/\n\n+/).map((para, i) => (
              <p
                key={i}
                className="small lh-lg mb-0"
                style={{ ...sectionCopyStyle, whiteSpace: "pre-wrap" }}
              >
                {para}
              </p>
            ))}
          </div>
        </SectionCard>
      )}

      {(ballotQuestion.voteEffectYes || ballotQuestion.voteEffectNo) && (
        <SectionCard>
          <h3 className="h5 mb-3 text-dark d-flex align-items-center gap-1">
            {t("ballotQuestion.voteEffects.title", { ns: "common" })}
            <QuestionTooltip
              text={t("ballotQuestion.voteEffects.tooltip", { ns: "common" })}
            />
          </h3>
          <div className="d-grid gap-3">
            {ballotQuestion.voteEffectYes && (
              <Callout
                label={t("ballotQuestion.voteEffects.yes", { ns: "common" })}
                value={ballotQuestion.voteEffectYes}
              />
            )}
            {ballotQuestion.voteEffectNo && (
              <Callout
                label={t("ballotQuestion.voteEffects.no", { ns: "common" })}
                value={ballotQuestion.voteEffectNo}
              />
            )}
          </div>
        </SectionCard>
      )}

      {ballotQuestion.fiscalConsequences && (
        <SectionCard>
          <h3 className="h5 mb-3 text-dark d-flex align-items-center gap-1">
            {t("ballotQuestion.fiscalConsequences.title", { ns: "common" })}
            <QuestionTooltip
              text={t("ballotQuestion.fiscalConsequences.tooltip", {
                ns: "common"
              })}
            />
          </h3>
          <p className="mb-0 lh-lg" style={{ whiteSpace: "pre-wrap" }}>
            {ballotQuestion.fiscalConsequences}
          </p>
        </SectionCard>
      )}

      {bill &&
        sortedHearings.length > 0 &&
        sortedHearings.some(h => new Date(h.startsAt) < new Date()) && (
          <SectionCard>
            <h3 className="h5 mb-4 text-dark">
              {t("ballotQuestion.committeeHearing.title", { ns: "common" })}
            </h3>
            <div className="d-grid gap-3">
              {sortedHearings
                .filter(h => new Date(h.startsAt) < new Date())
                .map(hearing => (
                  <CommitteeHearing key={hearing.id} hearing={hearing} />
                ))}
            </div>
          </SectionCard>
        )}
    </div>
  )
}

function Callout({ label, value }: { label: string; value: string }) {
  return (
    <div className="maple-muted-surface rounded-4 px-3 py-3">
      <div className="maple-eyebrow mb-1">{label}</div>
      <div className="lh-lg">{value}</div>
    </div>
  )
}

function BallotGlyph() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        display: "block",
        transform: "translateY(-1px)"
      }}
    >
      <path
        d="M8 4.75H14.4L18.25 8.6V17.75C18.25 18.9926 17.2426 20 16 20H8C6.75736 20 5.75 18.9926 5.75 17.75V7C5.75 5.75736 6.75736 4.75 8 4.75Z"
        fill="var(--maple-surface-base)"
        stroke="var(--maple-border-accent)"
        strokeWidth="1.5"
      />
      <path
        d="M14.25 4.75V7.85C14.25 8.49015 14.7598 9 15.4 9H18.25"
        stroke="var(--maple-border-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="8.3"
        y="10.1"
        width="2.7"
        height="2.7"
        rx="0.7"
        fill="var(--maple-surface-accent)"
        stroke="var(--maple-brand-primary)"
        strokeWidth="1.2"
      />
      <path
        d="M9.1 11.45L9.8 12.15L10.95 10.95"
        stroke="var(--maple-brand-primary)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.6 10.9H15.95"
        stroke="var(--maple-brand-primary)"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M8.3 15.2H15.95"
        stroke="var(--maple-text-muted)"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <section className="maple-surface rounded-4 px-4 py-4">{children}</section>
  )
}
