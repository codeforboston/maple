import React from "react"
import { Table } from "react-bootstrap"
import { useTranslation } from "next-i18next"
import type { LobbyingFiling } from "functions/src/lobbying/types"
import { normalizePosition } from "./activity"
import { LobbyingPositionChip } from "./LobbyingPositionChip"
import { MAPLE_COLORS } from "./chartTheme"
import { SosSourceLink } from "./SosSourceLink"
import { filingPeriodLabel } from "./filingPeriod"

interface LobbyingFilingsTableProps {
  filings: LobbyingFiling[]
  showBill?: boolean
  showClient?: boolean
  showFirm?: boolean
  showAmount?: boolean
  showActivity?: boolean
  maxRows?: number
  onViewAll?: () => void
  bordered?: boolean
}

export const LobbyingFilingsTable: React.FC<LobbyingFilingsTableProps> = ({
  filings,
  showBill = false,
  showClient = true,
  showFirm = true,
  showAmount = true,
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
      <Table hover responsive size="sm" style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            {showBill && <th>{t("fields.bills")}</th>}
            {showClient && <th>{t("fields.clientName")}</th>}
            {showFirm && <th>{t("fields.firmName")}</th>}
            {showActivity && <th>{t("fields.activity")}</th>}
            <th>{t("filters.position")}</th>
            {showAmount && (
              <th style={{ textAlign: "right" }}>{t("fields.amount")}</th>
            )}
            <th>{t("fields.period")}</th>
            {showSource && <th>{t("fields.source")}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(f => (
            <tr key={f.filingId}>
              {showBill && (
                <td style={cellStyle}>
                  {f.billId ? (
                    <a
                      href={`/lobbying/bills/${f.generalCourt}/${f.billId}`}
                      style={{ color: MAPLE_COLORS.primary }}
                    >
                      {f.billId}
                    </a>
                  ) : (
                    <NonBillActivity filing={f} showTitle={!showActivity} />
                  )}
                </td>
              )}
              {showClient && (
                <td style={cellStyle}>
                  <a
                    href={`/lobbying/clients/${encodeURIComponent(
                      f.clientNameNorm
                    )}`}
                    style={{ color: MAPLE_COLORS.primary }}
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
              {showAmount && (
                <td style={{ ...cellStyle, textAlign: "right" }}>
                  {f.amount != null
                    ? f.amount.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0
                      })
                    : "—"}
                </td>
              )}
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

/** A row with no bill, such as an Executive item: what it is, the agency
 * when the portal names one, and its title unless a column already shows it. */
const NonBillActivity: React.FC<{
  filing: LobbyingFiling
  showTitle: boolean
}> = ({ filing, showTitle }) => {
  const { t } = useTranslation("lobbying")
  const chamber =
    filing.chamber === "Executive"
      ? t("activity.chamberExecutive")
      : t("activity.chamberOther")
  // The portal's identifier cell reads "Other" on some Executive items,
  // which names no agency.
  const agency =
    filing.agency && filing.agency !== "Other" ? filing.agency : null
  return (
    <>
      <span style={{ color: MAPLE_COLORS.textBody, whiteSpace: "nowrap" }}>
        {agency ? t("activity.chamberAgency", { chamber, agency }) : chamber}
      </span>
      {showTitle && filing.activityTitle && (
        <div style={nonBillTitleStyle} title={filing.activityTitle}>
          {filing.activityTitle}
        </div>
      )}
    </>
  )
}

const nonBillTitleStyle: React.CSSProperties = {
  color: MAPLE_COLORS.textMuted,
  fontSize: 12,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  maxWidth: "28rem"
}

const tableStyle: React.CSSProperties = {
  fontSize: 13,
  color: MAPLE_COLORS.textBody,
  "--bs-table-bg": "var(--bs-gray-100)",
  "--bs-table-hover-bg": "rgba(15, 23, 42, 0.06)"
} as React.CSSProperties

const theadRowStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: MAPLE_COLORS.textMuted,
  borderBottom: `2px solid ${MAPLE_COLORS.borderDefault}`
}

const cellStyle: React.CSSProperties = {
  verticalAlign: "middle",
  padding: "0.4rem 0.5rem"
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
