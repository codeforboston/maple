import React from "react"
import { Table } from "react-bootstrap"
import { useTranslation } from "next-i18next"
import type { LobbyingFiling } from "functions/src/lobbying/types"
import { LobbyingPositionChip } from "./LobbyingPositionChip"
import { MAPLE_COLORS } from "./chartTheme"

interface LobbyingFilingsTableProps {
  filings: LobbyingFiling[]
  showBill?: boolean
  showClient?: boolean
  showFirm?: boolean
  showAmount?: boolean
  showActivity?: boolean
  maxRows?: number
  onViewAll?: () => void
}

export const LobbyingFilingsTable: React.FC<LobbyingFilingsTableProps> = ({
  filings,
  showBill = false,
  showClient = true,
  showFirm = true,
  showAmount = true,
  showActivity = false,
  maxRows,
  onViewAll
}) => {
  const { t } = useTranslation("lobbying")
  const rows = maxRows ? filings.slice(0, maxRows) : filings
  const truncated = maxRows != null && filings.length > maxRows

  if (filings.length === 0) {
    return (
      <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 14 }}>
        {t("noData")}
      </p>
    )
  }

  return (
    <div>
      <Table hover responsive size="sm" style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            {showBill && <th>{t("fields.bills")}</th>}
            {showClient && <th>{t("fields.clientName")}</th>}
            {showFirm && <th>{t("fields.firmName")}</th>}
            {showActivity && <th>Activity</th>}
            <th>{t("filters.position")}</th>
            {showAmount && (
              <th style={{ textAlign: "right" }}>{t("fields.amount")}</th>
            )}
            <th>{t("fields.year")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(f => (
            <tr key={f.filingId}>
              {showBill && (
                <td style={cellStyle}>
                  {f.billId ? (
                    <a href={`/bills/${f.generalCourt}/${f.billId}`}>
                      {f.billId}
                    </a>
                  ) : (
                    <span style={{ color: MAPLE_COLORS.textMuted }}>—</span>
                  )}
                </td>
              )}
              {showClient && <td style={cellStyle}>{f.clientName}</td>}
              {showFirm && <td style={cellStyle}>{f.entityName}</td>}
              {showActivity && (
                <td style={{ ...cellStyle, color: MAPLE_COLORS.textMuted }}>
                  {f.activityTitle || "—"}
                </td>
              )}
              <td style={cellStyle}>
                <LobbyingPositionChip position={f.position} />
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
              <td style={cellStyle}>{f.year}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {truncated && onViewAll && (
        <button onClick={onViewAll} style={viewAllStyle}>
          {t("billCard.viewAll")}
        </button>
      )}
    </div>
  )
}

const tableStyle: React.CSSProperties = {
  fontSize: 13,
  color: MAPLE_COLORS.textBody
}

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
