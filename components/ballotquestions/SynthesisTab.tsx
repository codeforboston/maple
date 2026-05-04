import { useTranslation } from "next-i18next"
import type { ReactNode } from "react"
import { BallotQuestion } from "../db"
import { QuestionTooltip } from "../tooltip"

export const SynthesisTab = ({
  ballotQuestion
}: {
  ballotQuestion: BallotQuestion
}) => {
  const { t } = useTranslation("ballotquestions")
  const yes = ballotQuestion.voteEffectYes
  const no = ballotQuestion.voteEffectNo
  const fiscal = ballotQuestion.fiscalConsequences

  return (
    <div className="d-grid gap-4">
      <SectionCard>
        <h2 className="h4 mb-1 text-secondary">
          {t("synthesis.title")}
        </h2>
        <p className="text-body-secondary small mb-0">
          {t("synthesis.description")}
        </p>
      </SectionCard>

      {(yes || no) && (
        <SectionCard>
          <div className="maple-eyebrow mb-3 d-flex align-items-center">
            {t("voteEffects.title")}
            <QuestionTooltip text={t("voteEffects.tooltip")} />
          </div>
          <div className="d-grid gap-3">
            {yes && (
              <Callout
                label={t("voteEffects.yes")}
                value={yes}
              />
            )}
            {no && (
              <Callout label={t("voteEffects.no")} value={no} />
            )}
          </div>
        </SectionCard>
      )}

      {fiscal && (
        <SectionCard>
          <div className="maple-eyebrow mb-2 d-flex align-items-center">
            {t("fiscalConsequences.title")}
            <QuestionTooltip
              text={t("fiscalConsequences.tooltip")}
            />
          </div>
          <p className="mb-0 lh-lg" style={{ whiteSpace: "pre-wrap" }}>
            {fiscal}
          </p>
        </SectionCard>
      )}
    </div>
  )
}

const SectionCard = ({ children }: { children: ReactNode }) => (
  <section className="maple-surface rounded-4 p-4">{children}</section>
)

const Callout = ({ label, value }: { label: string; value: string }) => (
  <div className="maple-muted-surface rounded-4 px-3 py-3">
    <div className="maple-eyebrow mb-1">{label}</div>
    <div className="lh-lg">{value}</div>
  </div>
)
