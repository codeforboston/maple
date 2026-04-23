import type { ReactNode } from "react"
import { BallotQuestion } from "../db"
import { QuestionTooltip } from "../tooltip"

type CampaignFinanceEntry = {
  cashRaised: number
  spent: number
  inKind: number
}

export const CampaignFinancialsTab = ({
  ballotQuestion
}: {
  ballotQuestion: BallotQuestion
}) => {
  const support = ballotQuestion.campaignFinancials?.support ?? []
  const oppose = ballotQuestion.campaignFinancials?.oppose ?? []

  return (
    <div className="d-grid gap-4">
      <SectionCard>
        <h2 className="h4 mb-1 text-secondary d-flex align-items-center gap-1">
          Campaign Financials
          <QuestionTooltip text="Committee receipts and expenditures are filed with the Office of Campaign and Political Finance." />
        </h2>
        <p className="text-body-secondary small mb-2">
          Committee receipts and expenditures from the{" "}
          {ballotQuestion.electionYear} ballot question filings.
        </p>
        <a
          href="https://www.ocpf.us/Reports/ballotquestionreports"
          target="_blank"
          rel="noopener noreferrer"
          className="maple-pill-link d-inline-flex align-items-center gap-2 rounded-pill border px-3 py-2 small fw-semibold text-decoration-none mt-3"
          style={{
            borderColor: "var(--maple-border-accent)",
            backgroundColor: "var(--maple-surface-base)",
            color: "var(--maple-brand-primary)"
          }}
        >
          <span>Reports for all ballot questions</span>
          <span aria-hidden="true">↗</span>
        </a>
      </SectionCard>

      {!ballotQuestion.campaignFinancials && (
        <SectionCard>
          <p className="text-body-secondary small mb-0">
            Campaign finance information is not yet available.
          </p>
        </SectionCard>
      )}

      {support.length > 0 && (
        <SectionCard>
          <div className="maple-eyebrow mb-1">Support</div>
          {ballotQuestion.supportCommittee && (
            <div className="fw-semibold text-dark mb-3">
              {ballotQuestion.supportCommittee}
            </div>
          )}
          <div className="d-grid gap-3">
            {support.map((entry, i) => (
              <FinanceCard key={i} entry={entry} />
            ))}
          </div>
        </SectionCard>
      )}

      {oppose.length > 0 && (
        <SectionCard>
          <div className="maple-eyebrow mb-1">Oppose</div>
          {ballotQuestion.opposeCommittee && (
            <div className="fw-semibold text-dark mb-3">
              {ballotQuestion.opposeCommittee}
            </div>
          )}
          <div className="d-grid gap-3">
            {oppose.map((entry, i) => (
              <FinanceCard key={i} entry={entry} />
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

const SectionCard = ({ children }: { children: ReactNode }) => (
  <section className="maple-surface rounded-4 p-4">{children}</section>
)

const FinanceCard = ({ entry }: { entry: CampaignFinanceEntry }) => (
  <div className="maple-muted-surface rounded-4 p-3 p-lg-4">
    <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center">
      <div className="flex-shrink-0">
        <Metric
          label="Receipts"
          value={formatMoney(entry.cashRaised)}
          tooltip="Contributions made in cash to the campaign"
        />
      </div>
      <div className="finance-spending-group rounded-3 p-3 flex-grow-1">
        <div className="row g-3">
          <Metric
            label="Expenditures"
            value={formatMoney(entry.spent)}
            tooltip="Cash spent by the campaign to support its objectives"
            colClass="col-12 col-sm-4"
          />
          <Metric
            label="Inkinds"
            value={formatMoney(entry.inKind)}
            tooltip="Cash value of contributions to the campaign made in goods, services, or commodities"
            colClass="col-12 col-sm-4"
          />
          <Metric
            label="Total"
            value={formatMoney(entry.spent + entry.inKind)}
            tooltip="Value of cash and in-kind expenditures made by the campaign"
            colClass="col-12 col-sm-4"
          />
        </div>
      </div>
    </div>
  </div>
)

const Metric = ({
  label,
  value,
  tooltip,
  colClass = "col-12 col-md-3"
}: {
  label: string
  value: string
  tooltip?: string
  colClass?: string
}) => (
  <div className={colClass}>
    <div className="maple-eyebrow mb-1 d-flex align-items-center gap-1">
      {label}
      {tooltip && <QuestionTooltip text={tooltip} />}
    </div>
    <div className="fw-semibold text-dark">{value}</div>
  </div>
)

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value)
