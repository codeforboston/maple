import React, { useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import { useLobbyingFilingsForCourt } from "components/db/lobbying"
import {
  LobbyingPositionChip,
  normalizePosition
} from "components/lobbying/LobbyingPositionChip"
import { MAPLE_COLORS } from "components/lobbying/chartTheme"
import { LobbyingAttribution } from "components/lobbying/LobbyingAttribution"

// General courts with lobbying data, newest first
const COURTS = [194, 193, 192, 191, 190, 189, 188, 187, 186, 185, 184]

type BillRow = {
  billId: string
  court: number
  total: number
  support: number
  oppose: number
  neutral: number
  none: number
}

function groupByBill(
  filings: ReturnType<typeof useLobbyingFilingsForCourt>["result"]
): BillRow[] {
  if (!filings) return []
  const map = new Map<string, BillRow>()
  for (const f of filings) {
    if (!f.billId || f.billId.length <= 2) continue
    if (!map.has(f.billId)) {
      map.set(f.billId, {
        billId: f.billId,
        court: f.generalCourt,
        total: 0,
        support: 0,
        oppose: 0,
        neutral: 0,
        none: 0
      })
    }
    const row = map.get(f.billId)!
    row[normalizePosition(f.position)]++
    row.total++
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}

function PositionMiniBar({ row }: { row: BillRow }) {
  if (row.total === 0) return null
  const pct = (n: number) => `${((n / row.total) * 100).toFixed(1)}%`
  return (
    <div
      style={{
        display: "flex",
        height: 6,
        borderRadius: 3,
        overflow: "hidden",
        width: 80,
        background: MAPLE_COLORS.graySubtleBorder
      }}
    >
      {row.support > 0 && (
        <div
          style={{ width: pct(row.support), background: MAPLE_COLORS.green }}
        />
      )}
      {row.oppose > 0 && (
        <div
          style={{ width: pct(row.oppose), background: MAPLE_COLORS.danger }}
        />
      )}
      {row.neutral > 0 && (
        <div
          style={{
            width: pct(row.neutral),
            background: MAPLE_COLORS.textMuted
          }}
        />
      )}
    </div>
  )
}

function LobbyingBillsTable() {
  const { t } = useTranslation("lobbying")
  const [court, setCourt] = useState(194)
  const [posFilter, setPosFilter] = useState<
    "all" | "support" | "oppose" | "neutral"
  >("all")
  const [search, setSearch] = useState("")

  const { result: filings, status, error } = useLobbyingFilingsForCourt(court)

  const bills = useMemo(() => groupByBill(filings), [filings])

  const filtered = useMemo(() => {
    return bills.filter(b => {
      if (posFilter !== "all" && b[posFilter] === 0) return false
      if (search && !b.billId.toLowerCase().includes(search.toLowerCase()))
        return false
      return true
    })
  }, [bills, posFilter, search])

  return (
    <>
      {/* Filters */}
      <div style={filterRowStyle}>
        <select
          value={court}
          onChange={e => setCourt(Number(e.target.value))}
          style={selectStyle}
          aria-label={t("filters.session")}
        >
          {COURTS.map(c => (
            <option key={c} value={c}>
              {t("filters.session")} {c}
            </option>
          ))}
        </select>

        <select
          value={posFilter}
          onChange={e => setPosFilter(e.target.value as typeof posFilter)}
          style={selectStyle}
          aria-label={t("filters.position")}
        >
          <option value="all">{t("filters.allPositions")}</option>
          <option value="support">{t("position.support")}</option>
          <option value="oppose">{t("position.oppose")}</option>
          <option value="neutral">{t("position.neutral")}</option>
        </select>

        <input
          type="search"
          placeholder={t("filters.search")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={searchStyle}
          aria-label={t("filters.search")}
        />
      </div>

      {/* Status */}
      {status === "loading" || status === "not-requested" ? (
        <p style={{ color: MAPLE_COLORS.textMuted, padding: "2rem 0" }}>
          {t("loading")}
        </p>
      ) : status === "error" ? (
        <p style={{ color: MAPLE_COLORS.danger, padding: "1rem 0" }}>
          Error: {error?.message}
        </p>
      ) : filtered.length === 0 ? (
        <p style={{ color: MAPLE_COLORS.textMuted, padding: "2rem 0" }}>
          {t("noData")}
        </p>
      ) : (
        <>
          <p
            style={{
              color: MAPLE_COLORS.textMuted,
              fontSize: 13,
              marginBottom: "0.5rem"
            }}
          >
            {filtered.length} {t("sections.bills").toLowerCase()}
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadStyle}>
                  <th style={thStyle}>Bill</th>
                  <th style={thStyle}>{t("filters.session")}</th>
                  <th style={thStyle}>{t("fields.filings")}</th>
                  <th style={thStyle}>{t("position.support")}</th>
                  <th style={thStyle}>{t("position.oppose")}</th>
                  <th style={thStyle}>{t("position.neutral")}</th>
                  <th style={thStyle}>Positions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.billId} style={trStyle}>
                    <td style={tdStyle}>
                      <a
                        href={`/bills/${b.court}/${b.billId}`}
                        style={{ color: MAPLE_COLORS.primary, fontWeight: 600 }}
                      >
                        {b.billId}
                      </a>
                    </td>
                    <td style={tdStyle}>{b.court}</td>
                    <td style={tdStyle}>{b.total}</td>
                    <td style={tdStyle}>
                      {b.support > 0 && (
                        <LobbyingPositionChip position="support" />
                      )}{" "}
                      {b.support > 0 && (
                        <span style={{ fontSize: 12 }}>{b.support}</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {b.oppose > 0 && (
                        <LobbyingPositionChip position="oppose" />
                      )}{" "}
                      {b.oppose > 0 && (
                        <span style={{ fontSize: 12 }}>{b.oppose}</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {b.neutral > 0 && (
                        <LobbyingPositionChip position="neutral" />
                      )}{" "}
                      {b.neutral > 0 && (
                        <span style={{ fontSize: 12 }}>{b.neutral}</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                      <PositionMiniBar row={b} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <LobbyingAttribution />
    </>
  )
}

function LobbyingBillsPage() {
  const { t } = useTranslation("lobbying")
  return (
    <Container>
      <Row className="mt-4 mb-3">
        <Col>
          <a
            href="/lobbying"
            style={{ color: MAPLE_COLORS.textMuted, fontSize: 13 }}
          >
            ← {t("titles.overview")}
          </a>
          <h1 className="mt-2">{t("titles.bills")}</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <LobbyingBillsTable />
        </Col>
      </Row>
    </Container>
  )
}

export default createPage({
  titleI18nKey: "titles.lobbying",
  Page: LobbyingBillsPage
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "lobbying"
])

// ── Styles ────────────────────────────────────────────────────────────────────

const filterRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap",
  marginBottom: "1rem",
  alignItems: "center"
}

const selectStyle: React.CSSProperties = {
  padding: "0.35rem 0.65rem",
  border: `1px solid ${MAPLE_COLORS.borderDefault}`,
  borderRadius: 6,
  fontSize: 14,
  color: MAPLE_COLORS.textBody,
  background: MAPLE_COLORS.surfaceBase,
  cursor: "pointer"
}

const searchStyle: React.CSSProperties = {
  ...selectStyle,
  minWidth: 180,
  cursor: "text"
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
  color: MAPLE_COLORS.textBody
}

const theadStyle: React.CSSProperties = {
  borderBottom: `2px solid ${MAPLE_COLORS.borderDefault}`
}

const thStyle: React.CSSProperties = {
  padding: "0.4rem 0.75rem",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: MAPLE_COLORS.textMuted,
  whiteSpace: "nowrap"
}

const trStyle: React.CSSProperties = {
  borderBottom: `1px solid ${MAPLE_COLORS.borderSubtle}`
}

const tdStyle: React.CSSProperties = {
  padding: "0.45rem 0.75rem",
  verticalAlign: "middle"
}
