import { useTranslation } from "next-i18next"
import { MembersFinance } from "components/db/membersFinance"

function formatCurrency(n?: number | null): string {
  if (n == null || isNaN(n)) return "$0"
  return "$" + Math.round(n).toLocaleString()
}

function formatPct(value: number, total: number): string {
  if (total === 0) return "0%"
  return Math.round((value / total) * 100) + "%"
}

interface CategoryRow {
  name: string
  value: number
}

export function FinanceTab({ finance }: { finance?: MembersFinance }) {
  const { t } = useTranslation("legislators")

  if (!finance) {
    return <p className="text-muted mt-3">{t("finance.noData")}</p>
  }

  const inKindTotal =
    finance.inKind.individual.amount +
    finance.inKind.committee.amount +
    finance.inKind.union.amount +
    finance.inKind.unitemized.amount

  const candidateFundsTotal =
    finance.candidateFunds.loans.amount +
    finance.candidateFunds.contributions.amount

  const categories: CategoryRow[] = [
    {
      name: t("finance.breakdown.individual"),
      value: finance.breakdown.individual.amount
    },
    {
      name: t("finance.breakdown.committee"),
      value: finance.breakdown.committee.amount
    },
    {
      name: t("finance.breakdown.union"),
      value: finance.breakdown.union.amount
    },
    {
      name: t("finance.breakdown.unitemized"),
      value: finance.breakdown.unitemized.amount
    },
    { name: t("finance.breakdown.candidateFunds"), value: candidateFundsTotal },
    { name: t("finance.breakdown.inKind"), value: inKindTotal }
  ]
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = categories.reduce((sum, c) => sum + c.value, 0)
  const processingFees = finance.breakdown.processingFees.amount

  const smallDonorTotal =
    finance.breakdown.smallDonors.itemized.amount +
    finance.breakdown.unitemized.amount

  const cycleYears = Object.keys(finance.years).map(Number)
  const cycleYear = cycleYears.length
    ? Math.max(...cycleYears)
    : new Date().getFullYear()

  const formatFullDate = (ts?: { toDate: () => Date }) =>
    ts
      ? ts.toDate().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : ""

  const bankDataAsOf = formatFullDate(finance.bankDataAsOf)
  const depositDataAsOf = formatFullDate(finance.depositDataAsOf)

  const statBoxes = [
    {
      label: t("finance.stats.totalRaised"),
      value: formatCurrency(finance.totalRaised),
      subtitles: [
        bankDataAsOf
          ? t("finance.stats.totalRaisedFeesSubtitle", { date: bankDataAsOf })
          : t("finance.stats.totalRaisedFeesSubtitleNoDate"),
        t("finance.stats.totalRaisedContributorsSubtitle", {
          count: finance.uniqueContributorsCount
        })
      ]
    },
    {
      label: t("finance.stats.totalSpent"),
      value: formatCurrency(finance.totalSpent),
      // Blank until the member has a Bank Report, the source of totalSpent
      subtitles: bankDataAsOf
        ? [t("finance.stats.totalSpentSubtitle", { date: bankDataAsOf })]
        : []
    },
    {
      label: t("finance.stats.smallDonors"),
      value: formatPct(smallDonorTotal, total),
      subtitles: [t("finance.stats.smallDonorsSubtitle")]
    },
    {
      label: t("finance.stats.cashOnHand"),
      value: formatCurrency(finance.cashOnHand),
      subtitles: [t("finance.stats.cashOnHandSubtitle")]
    }
  ]

  return (
    <div className="mt-3">
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#6c757d",
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 12
        }}
      >
        {t("finance.electionCycleHeading", { year: cycleYear })}
      </div>

      <div className="row row-cols-1 row-cols-sm-2 g-3 mb-4">
        {statBoxes.map(({ label, value, subtitles }) => (
          <div className="col" key={label}>
            <div
              style={{
                background: "white",
                border: "1px #dee2e6 solid",
                borderRadius: 8,
                padding: "20px 12px 20px 24px",
                height: "100%"
              }}
            >
              <div style={{ color: "#1a3185", fontSize: 22, fontWeight: 700 }}>
                {value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6c757d",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginTop: 4
                }}
              >
                {label}
              </div>
              {subtitles.map(subtitle => (
                <div
                  key={subtitle}
                  style={{ fontSize: 13, color: "#adb5bd", marginTop: 2 }}
                >
                  {subtitle}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#6c757d",
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 12
        }}
      >
        {t("finance.breakdownHeading")}
      </div>

      {categories.length === 0 ? (
        <p className="text-muted">{t("finance.noContributions")}</p>
      ) : (
        <div
          style={{
            background: "white",
            border: "1px #dee2e6 solid",
            borderRadius: 8,
            padding: "20px 24px"
          }}
        >
          <div
            className="d-flex justify-content-between"
            style={{
              borderBottom: "1px solid #dee2e6",
              paddingBottom: 8,
              fontSize: 12,
              fontWeight: 600,
              color: "#6c757d",
              textTransform: "uppercase",
              letterSpacing: 0.5
            }}
          >
            <span>{t("finance.table.category")}</span>
            <div className="d-flex">
              <span style={{ minWidth: 90, textAlign: "right" }}>
                {t("finance.table.amount")}
              </span>
              <span style={{ minWidth: 64, textAlign: "right" }}>
                {t("finance.table.share")}
              </span>
            </div>
          </div>

          {categories.map((c, i) => (
            <div
              key={c.name}
              className="d-flex justify-content-between align-items-center"
              style={{
                padding: "12px 0",
                borderBottom:
                  i < categories.length - 1 ? "1px solid #f1f3f5" : "none"
              }}
            >
              <span style={{ fontSize: 15 }}>{c.name}</span>
              <div className="d-flex align-items-center">
                <span
                  style={{ minWidth: 90, textAlign: "right", fontSize: 15 }}
                >
                  {formatCurrency(c.value)}
                </span>
                <span style={{ minWidth: 64, textAlign: "right" }}>
                  <span
                    style={{
                      display: "inline-block",
                      background: "#e7f1ff",
                      color: "#1a3185",
                      borderRadius: 999,
                      padding: "2px 10px",
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    {formatPct(c.value, total)}
                  </span>
                </span>
              </div>
            </div>
          ))}

          <p
            className="text-muted text-end mb-0"
            style={{ fontSize: 12, marginTop: 8, whiteSpace: "pre-line" }}
          >
            {depositDataAsOf
              ? t("finance.sourceWithDate", { date: depositDataAsOf })
              : t("finance.source")}
          </p>
        </div>
      )}

      {processingFees > 0 && (
        <p className="text-muted mt-3" style={{ fontSize: 12 }}>
          {t("finance.processingFees", {
            amount: formatCurrency(processingFees)
          })}
        </p>
      )}

      <p className="text-muted mt-3 mb-1" style={{ fontSize: 12 }}>
        {t("finance.stats.totalRaisedContributorsFootnote")}
      </p>
    </div>
  )
}
