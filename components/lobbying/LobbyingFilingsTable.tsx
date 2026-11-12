import React from "react"
import { Table } from "react-bootstrap"
import { useTranslation } from "next-i18next"
import type { LobbyingFiling } from "functions/src/lobbying/types"
import { normalizePosition } from "./activity"
import { LobbyingPositionChip } from "./LobbyingPositionChip"
import { MAPLE_COLORS } from "./chartTheme"
import { SosSourceLink } from "./SosSourceLink"
import { filingPeriodLabel } from "./filingPeriod"
import { thStyle } from "./SortTh"
import styles from "./lobbying.module.css"

interface LobbyingFilingsTableProps {
  filings: LobbyingFiling[]
  showClient?: boolean
  showFirm?: boolean
  showActivity?: boolean
  maxRows?: number
  onViewAll?: () => void
  bordered?: boolean
}

export const LobbyingFilingsTable: React.FC<LobbyingFilingsTableProps> = ({
  filings,
  showClient = true,
  showFirm = true,
  showActivity = false,
  maxRows,
  onViewAll,
  bordered = false
}) => {
  const { t, i18n } = useTranslation("lobbying")
  const rows = maxRows ? filings.slice(0, maxRows) : filings
  const truncated = maxRows != null && filings.length > maxRows
  const showSource = rows.some(f => f.disclosureUrl)

  if (filings.length === 0) {
    return (
      <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 14 }}>
        {t("noData")}
      </p>
    )
  }

  return (
    <div
      style={
        bordered
          ? {
              border: "1px solid var(--bs-border-color)",
              borderRadius: 6,
              overflow: "hidden"
            }
          : undefined
      }
    >
      <Table responsive size="sm" style={tableStyle}>
        <thead>
          {/* The Lobbying Explorer's headers (SortTh's thStyle). */}
          <tr>
            {showClient && <th style={thStyle}>{t("fields.clientName")}</th>}
            {showFirm && <th style={thStyle}>{t("fields.firmName")}</th>}
            {showActivity && <th style={thStyle}>{t("fields.activity")}</th>}
            <th style={thStyle}>{t("filters.position")}</th>
            <th style={thStyle}>{t("fields.period")}</th>
            {showSource && <th style={thStyle}>{t("fields.source")}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(f => (
            <tr key={f.filingId}>
              {showClient && (
                <td style={cellStyle}>
                  <a
                    href={`/lobbying/clients/${encodeURIComponent(
                      f.clientNameNorm
                    )}`}
                    className={styles.quietLink}
                    style={{ color: MAPLE_COLORS.primary, fontWeight: 600 }}
                  >
                    {f.clientName}
                  </a>
                </td>
              )}
              {showFirm && (
                <td style={cellStyle}>
                  <a
                    href={`/lobbying/firms/${encodeURIComponent(
                      f.entityNameNorm
                    )}`}
                    className={styles.quietLink}
                    style={{ color: MAPLE_COLORS.primary }}
                  >
                    {f.entityName}
                  </a>
                </td>
              )}
              {showActivity && (
                <td style={{ ...cellStyle, color: MAPLE_COLORS.textMuted }}>
                  {f.activityTitle || "—"}
                </td>
              )}
              <td style={cellStyle}>
                <LobbyingPositionChip
                  position={normalizePosition(f.position)}
                />
              </td>
              <td style={{ ...cellStyle, whiteSpace: "nowrap" }}>
                {filingPeriodLabel(f, i18n.language)}
              </td>
              {showSource && (
                <td style={cellStyle}>
                  <SosSourceLink href={f.disclosureUrl} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
      {truncated && (
        <p style={truncatedNoteStyle}>
          {t("billCard.showingOf", {
            showing: rows.length,
            total: filings.length
          })}
        </p>
      )}
      {truncated && onViewAll && (
        <button onClick={onViewAll} style={viewAllStyle}>
          {t("billCard.viewAll")}
        </button>
      )}
    </div>
  )
}

/** On the card's own white, with no highlight on hover. */
const tableStyle: React.CSSProperties = {
  fontSize: 14,
  color: MAPLE_COLORS.textBody,
  marginBottom: 0,
  "--bs-table-bg": "transparent"
} as React.CSSProperties

/** The Lobbying Explorer's cells (ActivityTable): a light rule between rows. */
const cellStyle: React.CSSProperties = {
  verticalAlign: "middle",
  padding: "0.6rem 0.75rem",
  borderTop: `1px solid ${MAPLE_COLORS.borderSubtle}`,
  borderBottom: 0
}

const truncatedNoteStyle: React.CSSProperties = {
  fontSize: 12,
  color: MAPLE_COLORS.textMuted,
  margin: "0.25rem 0 0"
}

const viewAllStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: MAPLE_COLORS.primary,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
  textDecoration: "underline"
}
