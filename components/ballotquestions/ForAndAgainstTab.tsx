import { useTranslation } from "next-i18next"
import type { ReactNode } from "react"
import { useMemo } from "react"
import { BallotQuestion } from "../db"
import { formatTestimony } from "components/testimony/formatting"

export const ForAndAgainstTab = ({
  ballotQuestion
}: {
  ballotQuestion: BallotQuestion
}) => {
  const { t } = useTranslation("common")

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
            <BalanceGlyph />
          </div>
          <div>
            <h2 className="h4 mb-1 text-secondary">
              {t("ballotQuestion.forAndAgainst.argumentsTitle")}
            </h2>
            <p className="text-body-secondary small mb-0 lh-lg">
              {t("ballotQuestion.forAndAgainst.argumentsBody")}
            </p>
          </div>
        </div>
      </SectionCard>

      {hasAnyData(ballotQuestion) ? (
        <>
          <ArgumentCard
            title={t("ballotQuestion.forAndAgainst.inFavorTitle")}
            committee={ballotQuestion.supportCommittee}
            statement={ballotQuestion.inFavor}
            noCommitteeText={t("ballotQuestion.forAndAgainst.noCommitteeText")}
            noStatementText={t("ballotQuestion.forAndAgainst.noStatementText")}
          />
          <ArgumentCard
            title={t("ballotQuestion.forAndAgainst.againstTitle")}
            committee={ballotQuestion.opposeCommittee}
            statement={ballotQuestion.against}
            noCommitteeText={t("ballotQuestion.forAndAgainst.noCommitteeText")}
            noStatementText={t("ballotQuestion.forAndAgainst.noStatementText")}
          />
        </>
      ) : (
        <SectionCard>
          <p className="text-body-secondary small mb-0">
            {t("ballotQuestion.forAndAgainst.noCommitteeText")}
          </p>
        </SectionCard>
      )}
    </div>
  )
}

const hasAnyData = (bq: BallotQuestion) =>
  Boolean(bq.inFavor || bq.against || bq.supportCommittee || bq.opposeCommittee)

const ArgumentCard = ({
  title,
  committee,
  statement,
  noCommitteeText,
  noStatementText
}: {
  title: string
  committee: string | null
  statement: string | null
  noCommitteeText: string
  noStatementText: string
}) => (
  <SectionCard>
    <h3 className="h5 mb-3 text-dark">{title}</h3>
    {committee ? (
      <div className="maple-eyebrow small mb-3">{committee}</div>
    ) : (
      <p className="text-body-secondary small mb-3">{noCommitteeText}</p>
    )}
    {statement ? (
      <BallotQuestionMarkdown content={statement} />
    ) : (
      <p className="text-body-secondary small mb-0">{noStatementText}</p>
    )}
  </SectionCard>
)

function BallotQuestionMarkdown({ content }: { content: string }) {
  const htmlContent = useMemo(() => formatTestimony(content), [content])

  return (
    <div
      className="maple-muted-surface rounded-4 px-4 py-4 lh-lg ballot-question-markdown"
      dangerouslySetInnerHTML={htmlContent}
    />
  )
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <section className="maple-surface rounded-4 px-4 py-4">{children}</section>
  )
}

function BalanceGlyph() {
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
        d="M4 19H20"
        stroke="var(--maple-border-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 3V18"
        stroke="var(--maple-border-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle
        cx="5"
        cy="12"
        r="2.5"
        stroke="var(--maple-brand-primary)"
        strokeWidth="1.5"
        fill="var(--maple-surface-accent)"
      />
      <circle
        cx="19"
        cy="12"
        r="2.5"
        stroke="var(--maple-brand-primary)"
        strokeWidth="1.5"
        fill="var(--maple-surface-accent)"
      />
      <path
        d="M12 3L7 12"
        stroke="var(--maple-border-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3L17 12"
        stroke="var(--maple-border-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
