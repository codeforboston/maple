import type { ReactNode } from "react"
import { BallotQuestion } from "../db"
import { QuestionTooltip } from "../tooltip"

export const SynthesisTab = ({
  ballotQuestion
}: {
  ballotQuestion: BallotQuestion
}) => {
  const yes = ballotQuestion.voteEffectYes
  const no = ballotQuestion.voteEffectNo
  const fiscal = ballotQuestion.fiscalConsequences

  return (
    <div className="d-grid gap-4">
      <SectionCard>
        <h2 className="h4 mb-1 text-secondary">Synthesis & Insights</h2>
        <p className="text-body-secondary small mb-0">
          Vote effects and fiscal consequences from the voter guide.
        </p>
      </SectionCard>

      {(yes || no) && (
        <SectionCard>
          <div className="maple-eyebrow mb-3 d-flex align-items-center">
            What your vote will do
            <QuestionTooltip text="As required by law, the statements describing the effect of a “yes” or “no” vote are written jointly by the State Attorney General and the Secretary of the Commonwealth." />
          </div>
          <div className="d-grid gap-3">
            {yes && <Callout label="Voting YES" value={yes} />}
            {no && <Callout label="Voting NO" value={no} />}
          </div>
        </SectionCard>
      )}

      {fiscal && (
        <SectionCard>
          <div className="maple-eyebrow mb-2 d-flex align-items-center">
            Statement of Fiscal Consequences
            <QuestionTooltip text="As required by law, statements of fiscal consequences are written by the Executive Office of Administration and Finance." />
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
