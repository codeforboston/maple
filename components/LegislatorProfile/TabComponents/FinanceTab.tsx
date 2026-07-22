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
    (finance.inKind?.individual?.amount ?? 0) +
    (finance.inKind?.committee?.amount ?? 0) +
    (finance.inKind?.union?.amount ?? 0) +
    (finance.inKind?.unitemized?.amount ?? 0)

  const candidateFundsTotal =
    (finance.candidateFunds?.loans?.amount ?? 0) +
    (finance.candidateFunds?.contributions?.amount ?? 0)

  const categories: CategoryRow[] = [
    {
      name: t("finance.breakdown.individual"),
      value: finance.breakdown?.individual?.amount ?? 0
    },
    {
      name: t("finance.breakdown.committee"),
      value: finance.breakdown?.committee?.amount ?? 0
    },
    {
      name: t("finance.breakdown.union"),
      value: finance.breakdown?.union?.amount ?? 0
    },
    {
      name: t("finance.breakdown.unitemized"),
      value: finance.breakdown?.unitemized?.amount ?? 0
    },
    { name: t("finance.breakdown.candidateFunds"), value: candidateFundsTotal },
    { name: t("finance.breakdown.inKind"), value: inKindTotal }
  ]
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = categories.reduce((sum, c) => sum + c.value, 0)
  const nonContribution = finance.otherReceipts?.nonContribution?.amount ?? 0
  const processingFees = finance.breakdown?.processingFees?.amount ?? 0

  const smallDonorTotal =
    (finance.breakdown?.smallDonors?.itemized?.amount ?? 0) +
    (finance.breakdown?.unitemized?.amount ?? 0)

  const cycleYears = Object.keys(finance.years ?? {}).map(Number)
  const cycleYear = cycleYears.length
    ? Math.max(...cycleYears)
    : new Date().getFullYear()

  const totalSpentAsOf = finance.lastUpdated
    ? finance.lastUpdated
        .toDate()
        .toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : ""

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
      subtitle: t("finance.stats.totalRaisedSubtitle", {
        count: finance.contributorCount ?? 0
      }),
      footnote: t("finance.stats.totalRaisedFootnote", { date: bankDataAsOf })
    },
    {
      label: t("finance.stats.totalSpent"),
      value: formatCurrency(finance.totalSpent),
      subtitle: t("finance.stats.totalSpentSubtitle", { date: totalSpentAsOf }),
      footnote: undefined as string | undefined
    },
    {
      label: t("finance.stats.smallDonors"),
      value: formatPct(smallDonorTotal, total),
      subtitle: t("finance.stats.smallDonorsSubtitle"),
      footnote: undefined as string | undefined
    },
    {
      label: t("finance.stats.cashOnHand"),
      value: formatCurrency(finance.cashOnHand),
      subtitle: t("finance.stats.cashOnHandSubtitle"),
      footnote: undefined as string | undefined
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
        {statBoxes.map(({ label, value, subtitle, footnote }) => (
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
              <div style={{ fontSize: 13, color: "#adb5bd", marginTop: 2 }}>
                {subtitle}
              </div>
              {footnote && (
                <div
                  style={{
                    fontSize: 11,
                    fontStyle: "italic",
                    color: "#adb5bd",
                    marginTop: 4
                  }}
                >
                  {footnote}
                </div>
              )}
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

      {nonContribution > 0 && (
        <p className="text-muted mt-3" style={{ fontSize: 12 }}>
          {t("finance.otherReceipts", {
            amount: formatCurrency(nonContribution)
          })}
        </p>
      )}

      {processingFees > 0 && (
        <p className="text-muted mt-3" style={{ fontSize: 12 }}>
          {t("finance.processingFees", {
            amount: formatCurrency(processingFees)
          })}
        </p>
      )}
    </div>
  )
}
