import React from "react"
import { useTranslation } from "next-i18next"
import { useLobbyingFilingsForBill } from "components/db/lobbying"
import { LobbyingFilingsTable } from "./LobbyingFilingsTable"
import { LobbyingPaginationBar } from "./LobbyingPaginationBar"
import { usePagination } from "./usePagination"
import { MAPLE_COLORS, POSITION_COLORS } from "./chartTheme"
import { normalizePosition } from "./activity"
import { BetaTag } from "components/shared/CommonComponents"
import { LobbyingPanel } from "./LobbyingPanel"
import { LegendSwatch, legendStyle } from "./PositionBar"
import styles from "./lobbying.module.css"

const PAGE_SIZE = 10

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
  const { page, setPage, pageItems, totalPages, totalItems } = usePagination(
    filings ?? [],
    PAGE_SIZE
  )

  // The Lobbying Explorer's panel (LobbyingPanel), its title with the BETA
  // tag, and "Open in Lobbying Explorer" at its right once there is
  // something to open.
  const explorerHref = `/lobbying/bills/${court}/${billId}`
  const frame = (body: React.ReactNode, link = false) => (
    <div className={className}>
      <LobbyingPanel
        title={
          <span className="d-inline-flex align-items-center">
            {t("lobbying:billCard.title")}
            <BetaTag>{t("common:beta_feature")}</BetaTag>
          </span>
        }
        aside={
          link ? (
            <a
              href={explorerHref}
              className={styles.quietLink}
              style={viewAllLinkStyle}
            >
              {t("lobbying:billCard.viewAll")}
            </a>
          ) : undefined
        }
      >
        {body}
      </LobbyingPanel>
    </div>
  )

  if (status === "loading" || status === "not-requested") {
    return frame(
      <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 14, margin: 0 }}>
        {t("lobbying:loading")}
      </p>
    )
  }

  if (status === "error") {
    if (process.env.NODE_ENV === "development") {
      return frame(
        <p style={{ color: MAPLE_COLORS.danger, fontSize: 13, margin: 0 }}>
          Lobbying data error: {error?.message}
        </p>
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

  return frame(
    <>
      <PositionBar counts={counts} total={total} />

      <ul style={{ ...legendStyle, margin: "0.5rem 0 1rem" }}>
        <LegendItem
          label={t("lobbying:position.support")}
          color={POSITION_COLORS.support}
          count={counts.support}
        />
        <LegendItem
          label={t("lobbying:position.oppose")}
          color={POSITION_COLORS.oppose}
          count={counts.oppose}
        />
        <LegendItem
          label={t("lobbying:position.neutral")}
          color={POSITION_COLORS.neutral}
          count={counts.neutral}
        />
      </ul>

      <LobbyingFilingsTable filings={pageItems} showClient showFirm />
      <LobbyingPaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPage={setPage}
        itemLabel={t("lobbying:billCard.filingsLabel")}
      />
    </>,
    true
  )
}

/** The filings by position, in the shared bar's shape (PositionBar.tsx: 10px
 * tall, fully rounded) and colours. Its own, as it counts filings, where the
 * shared one counts organizations. */
const PositionBar: React.FC<{
  counts: { support: number; oppose: number; neutral: number; none: number }
  total: number
}> = ({ counts, total }) => {
  if (total === 0) return null
  const segments = [
    { n: counts.support, color: POSITION_COLORS.support },
    { n: counts.oppose, color: POSITION_COLORS.oppose },
    { n: counts.neutral, color: POSITION_COLORS.neutral },
    { n: counts.none, color: MAPLE_COLORS.graySubtleBorder }
  ].filter(s => s.n > 0)
  return (
    <div style={barStyle}>
      {segments.map((s, i) => (
        <div
          key={i}
          style={{ width: `${(s.n / total) * 100}%`, background: s.color }}
        />
      ))}
    </div>
  )
}

/** A legend entry, as the shared legend's (PositionBar.tsx). */
const LegendItem: React.FC<{
  label: string
  color: string
  count: number
}> = ({ label, color, count }) => {
  if (count === 0) return null
  return (
    <li style={legendItemStyle}>
      <LegendSwatch background={color} />
      {label} ({count})
    </li>
  )
}

const barStyle: React.CSSProperties = {
  display: "flex",
  height: 10,
  borderRadius: 5,
  overflow: "hidden"
}

const legendItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: 13,
  color: MAPLE_COLORS.textMuted
}

const viewAllLinkStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: MAPLE_COLORS.primary,
  whiteSpace: "nowrap"
}
