import React from "react"
import { useTranslation } from "next-i18next"
import { useLobbyingFilingsForBill } from "components/db/lobbying"
import { LobbyingFilingsTable } from "./LobbyingFilingsTable"
import { MAPLE_COLORS } from "./chartTheme"
import { normalizePosition } from "./LobbyingPositionChip"

interface LobbyingBillCardProps {
  court: number
  billId: string
  className?: string
}

export const LobbyingBillCard: React.FC<LobbyingBillCardProps> = ({
  court,
  billId,
  className
}) => {
  const { t } = useTranslation(["lobbying", "common"])
  const {
    result: filings,
    status,
    error
  } = useLobbyingFilingsForBill(court, billId)

  if (status === "loading" || status === "not-requested") {
    return (
      <div style={cardStyle} className={className}>
        <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 14, margin: 0 }}>
          {t("lobbying:loading")}
        </p>
      </div>
    )
  }

  if (status === "error") {
    if (process.env.NODE_ENV === "development") {
      return (
        <div style={cardStyle} className={className}>
          <p style={{ color: MAPLE_COLORS.danger, fontSize: 13, margin: 0 }}>
            Lobbying data error: {error?.message}
          </p>
        </div>
      )
    }
    return null
  }

  if (!filings || filings.length === 0) return null

  const counts = { support: 0, oppose: 0, neutral: 0, none: 0 }
  for (const f of filings) {
    const pos = normalizePosition(f.position)
    counts[pos]++
  }
  const total = filings.length

  const explorerHref = `/lobbying/bills?bill=${billId}&gc=${court}`

  return (
    <div style={cardStyle} className={className}>
      <div style={headerStyle}>
        <span style={titleStyle}>{t("lobbying:titles.overview")}</span>
        <span style={countStyle}>
          {t("lobbying:billCard.filingCount_other", { count: total })}
        </span>
      </div>

      <PositionBar counts={counts} total={total} />

      <div style={legendRowStyle}>
        <LegendItem
          label={t("lobbying:position.support")}
          color={MAPLE_COLORS.green}
          count={counts.support}
        />
        <LegendItem
          label={t("lobbying:position.oppose")}
          color={MAPLE_COLORS.danger}
          count={counts.oppose}
        />
        <LegendItem
          label={t("lobbying:position.neutral")}
          color={MAPLE_COLORS.textMuted}
          count={counts.neutral}
        />
      </div>

      <LobbyingFilingsTable
        filings={filings}
        showBill={false}
        showClient
        showFirm
        showAmount={false}
        maxRows={5}
        onViewAll={() => window.open(explorerHref, "_self")}
      />

      <a href={explorerHref} style={viewAllLinkStyle}>
        {t("lobbying:billCard.viewAll")}
      </a>
    </div>
  )
}

const PositionBar: React.FC<{
  counts: { support: number; oppose: number; neutral: number; none: number }
  total: number
}> = ({ counts, total }) => {
  if (total === 0) return null
  const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`
  return (
    <div style={barContainerStyle} title="Support / Oppose / Neutral">
      {counts.support > 0 && (
        <div
          style={{
            ...barSegmentStyle,
            width: pct(counts.support),
            background: MAPLE_COLORS.green,
            borderRadius:
              counts.oppose === 0 && counts.neutral === 0
                ? "4px"
                : "4px 0 0 4px"
          }}
        />
      )}
      {counts.oppose > 0 && (
        <div
          style={{
            ...barSegmentStyle,
            width: pct(counts.oppose),
            background: MAPLE_COLORS.danger,
            borderRadius:
              counts.support === 0 && counts.neutral === 0
                ? "4px"
                : counts.support === 0
                ? "4px 0 0 4px"
                : counts.neutral === 0
                ? "0 4px 4px 0"
                : "0"
          }}
        />
      )}
      {counts.neutral > 0 && (
        <div
          style={{
            ...barSegmentStyle,
            width: pct(counts.neutral),
            background: MAPLE_COLORS.textMuted,
            borderRadius: "0 4px 4px 0"
          }}
        />
      )}
      {counts.none > 0 && (
        <div
          style={{
            ...barSegmentStyle,
            width: pct(counts.none),
            background: MAPLE_COLORS.graySubtleBorder,
            borderRadius: "0 4px 4px 0"
          }}
        />
      )}
    </div>
  )
}

const LegendItem: React.FC<{
  label: string
  color: string
  count: number
}> = ({ label, color, count }) => {
  if (count === 0) return null
  return (
    <span style={legendItemStyle}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
          marginRight: 4
        }}
      />
      {label} ({count})
    </span>
  )
}

const cardStyle: React.CSSProperties = {
  background: MAPLE_COLORS.surfaceBase,
  border: `1px solid ${MAPLE_COLORS.borderDefault}`,
  borderRadius: 8,
  boxShadow: "0 0.25rem 1rem rgba(15, 23, 42, 0.06)",
  padding: "1rem"
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  marginBottom: "0.75rem"
}

const titleStyle: React.CSSProperties = {
  fontFamily: "Nunito, system-ui, sans-serif",
  fontWeight: 700,
  fontSize: 13,
  color: MAPLE_COLORS.textMuted,
  textTransform: "uppercase",
  letterSpacing: "0.06em"
}

const countStyle: React.CSSProperties = {
  fontSize: 12,
  color: MAPLE_COLORS.textMuted
}

const barContainerStyle: React.CSSProperties = {
  display: "flex",
  height: 8,
  borderRadius: 4,
  overflow: "hidden",
  marginBottom: "0.5rem",
  background: MAPLE_COLORS.graySubtleBorder
}

const barSegmentStyle: React.CSSProperties = {
  height: "100%",
  transition: "width 0.2s ease"
}

const legendRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  marginBottom: "0.75rem",
  flexWrap: "wrap"
}

const legendItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontSize: 12,
  color: MAPLE_COLORS.textMuted
}

const viewAllLinkStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: MAPLE_COLORS.primary,
  textDecoration: "none",
  marginTop: "0.5rem"
}
