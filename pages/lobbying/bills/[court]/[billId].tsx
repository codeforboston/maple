import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import { useLobbyingFilingsForBill } from "components/db/lobbying"
import { LobbyingFilingsTable } from "components/lobbying/LobbyingFilingsTable"
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"
import { LobbyingAttribution } from "components/lobbying/LobbyingAttribution"
import { usePagination } from "components/lobbying/usePagination"
import { LobbyingPaginationBar } from "components/lobbying/LobbyingPaginationBar"
import { normalizePosition } from "components/lobbying/LobbyingPositionChip"
import { MAPLE_COLORS } from "components/lobbying/chartTheme"
import type { LobbyingFiling } from "functions/src/lobbying/types"
import styles from "components/lobbying/lobbying.module.css"

const PAGE_SIZE = 50

type SortKey = "client" | "firm" | "position" | "amount" | "year"
type SortDir = "asc" | "desc"

function sortFilings(
  filings: LobbyingFiling[],
  key: SortKey,
  dir: SortDir
): LobbyingFiling[] {
  const mul = dir === "asc" ? 1 : -1
  return [...filings].sort((a, b) => {
    switch (key) {
      case "client":
        return mul * a.clientName.localeCompare(b.clientName)
      case "firm":
        return mul * a.entityName.localeCompare(b.entityName)
      case "position":
        return (
          mul *
          normalizePosition(a.position).localeCompare(
            normalizePosition(b.position)
          )
        )
      case "amount":
        return mul * ((a.amount ?? -1) - (b.amount ?? -1))
      case "year":
        return mul * (a.year - b.year)
      default:
        return 0
    }
  })
}

function SortTh({
  label,
  sortKey,
  current,
  dir,
  onSort,
  style,
  className
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: SortDir
  onSort: (k: SortKey) => void
  style?: React.CSSProperties
  className?: string
}) {
  const active = sortKey === current
  const indicator = active ? (dir === "asc" ? " ↑" : " ↓") : ""
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={className}
      style={{
        ...thStyle,
        ...style,
        cursor: "pointer",
        color: active ? MAPLE_COLORS.primary : MAPLE_COLORS.textMuted,
        userSelect: "none"
      }}
    >
      {label}
      <span style={{ fontSize: 10, opacity: active ? 1 : 0 }}>{indicator}</span>
    </th>
  )
}

function BillFilingsPage() {
  const { t } = useTranslation("lobbying")
  const { query } = useRouter()
  const court = Number(query.court)
  const billId = query.billId as string | undefined

  const {
    result: filings,
    status,
    error
  } = useLobbyingFilingsForBill(court, billId ?? "")

  const [sortKey, setSortKey] = useState<SortKey>("year")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [posFilter, setPosFilter] = useState<
    "all" | "support" | "oppose" | "neutral"
  >("all")

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "client" || key === "firm" ? "asc" : "desc")
    }
  }

  const filtered = useMemo(() => {
    if (!filings) return []
    if (posFilter === "all") return filings
    return filings.filter(f => normalizePosition(f.position) === posFilter)
  }, [filings, posFilter])

  const sorted = useMemo(
    () => sortFilings(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir]
  )

  const { page, setPage, pageItems, totalPages, totalItems } = usePagination(
    sorted,
    PAGE_SIZE
  )

  useEffect(() => {
    setPage(1)
  }, [posFilter, sortKey, sortDir, setPage])

  const loading = status === "loading" || status === "not-requested"
  const mapleHref = court && billId ? `/bills/${court}/${billId}` : undefined

  if (!billId) return null

  return (
    <>
      <LobbyingSubnav />
      <Container>
        <Row className="mt-4 mb-1">
          <Col>
            <a
              href="/lobbying/bills"
              style={{ color: MAPLE_COLORS.textMuted, fontSize: 13 }}
            >
              ← {t("titles.bills")}
            </a>
            <h1 className="mt-2">{billId}</h1>
            {mapleHref && (
              <p style={{ fontSize: 13, marginBottom: "0.25rem" }}>
                <a href={mapleHref} style={{ color: MAPLE_COLORS.primary }}>
                  {t("misc.viewOnMaple")}
                </a>
              </p>
            )}
            {!loading && filings && (
              <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 14 }}>
                {filings.length} {t("fields.filings").toLowerCase()}
              </p>
            )}
          </Col>
        </Row>

        {loading && (
          <p style={{ color: MAPLE_COLORS.textMuted }}>{t("loading")}</p>
        )}
        {status === "error" && (
          <p style={{ color: MAPLE_COLORS.danger }}>Error: {error?.message}</p>
        )}

        {!loading && (
          <>
            <Row className="mb-2">
              <Col>
                <div style={filterRowStyle}>
                  <select
                    value={posFilter}
                    onChange={e =>
                      setPosFilter(e.target.value as typeof posFilter)
                    }
                    style={selectStyle}
                    aria-label={t("filters.position")}
                  >
                    <option value="all">{t("filters.allPositions")}</option>
                    <option value="support">{t("position.support")}</option>
                    <option value="oppose">{t("position.oppose")}</option>
                    <option value="neutral">{t("position.neutral")}</option>
                  </select>
                  <span style={{ color: MAPLE_COLORS.textMuted, fontSize: 13 }}>
                    {totalItems} {t("fields.filings").toLowerCase()}
                  </span>
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={theadRowStyle}>
                        <SortTh
                          label={t("fields.clientName")}
                          sortKey="client"
                          current={sortKey}
                          dir={sortDir}
                          onSort={handleSort}
                        />
                        <SortTh
                          label={t("fields.firmName")}
                          sortKey="firm"
                          current={sortKey}
                          dir={sortDir}
                          onSort={handleSort}
                        />
                        <th style={thStyle} className={styles.mobileHide}>
                          {t("fields.activity")}
                        </th>
                        <SortTh
                          label={t("filters.position")}
                          sortKey="position"
                          current={sortKey}
                          dir={sortDir}
                          onSort={handleSort}
                        />
                        <SortTh
                          label={t("fields.amount")}
                          sortKey="amount"
                          current={sortKey}
                          dir={sortDir}
                          onSort={handleSort}
                          style={{ textAlign: "right" }}
                        />
                        <SortTh
                          label={t("fields.year")}
                          sortKey="year"
                          current={sortKey}
                          dir={sortDir}
                          onSort={handleSort}
                        />
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map(f => (
                        <tr key={f.filingId} style={trStyle}>
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
                          <td
                            className={styles.mobileHide}
                            style={{
                              ...cellStyle,
                              color: MAPLE_COLORS.textMuted,
                              fontSize: 12
                            }}
                          >
                            {f.activityTitle || "—"}
                          </td>
                          <td style={cellStyle}>
                            <span
                              style={{
                                ...chipStyle,
                                ...posChipStyle(normalizePosition(f.position))
                              }}
                            >
                              {f.position || "—"}
                            </span>
                          </td>
                          <td style={{ ...cellStyle, textAlign: "right" }}>
                            {f.amount != null
                              ? f.amount.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                  maximumFractionDigits: 0
                                })
                              : "—"}
                          </td>
                          <td style={cellStyle}>{f.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <LobbyingPaginationBar
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={PAGE_SIZE}
                  onPage={setPage}
                />
              </Col>
            </Row>
          </>
        )}
        <LobbyingAttribution className="mt-3" />
      </Container>
    </>
  )
}

export default createPage({
  titleI18nKey: "titles.lobbying",
  Page: BillFilingsPage
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "lobbying"
])

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const filterRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  alignItems: "center",
  marginBottom: "0.5rem"
}

const selectStyle: React.CSSProperties = {
  padding: "0.3rem 0.6rem",
  border: `1px solid ${MAPLE_COLORS.borderDefault}`,
  borderRadius: 6,
  fontSize: 14,
  color: MAPLE_COLORS.textBody,
  background: MAPLE_COLORS.surfaceBase,
  cursor: "pointer"
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
  color: MAPLE_COLORS.textBody
}

const theadRowStyle: React.CSSProperties = {
  borderBottom: `2px solid ${MAPLE_COLORS.borderDefault}`
}

const thStyle: React.CSSProperties = {
  padding: "0.4rem 0.75rem",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: MAPLE_COLORS.textMuted,
  whiteSpace: "nowrap" as const
}

const trStyle: React.CSSProperties = {
  borderBottom: `1px solid ${MAPLE_COLORS.borderSubtle}`
}

const cellStyle: React.CSSProperties = {
  padding: "0.45rem 0.75rem",
  verticalAlign: "middle"
}

const chipStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "0.15rem 0.5rem",
  borderRadius: 12,
  fontSize: 11,
  fontWeight: 600,
  border: "1px solid",
  whiteSpace: "nowrap" as const
}

function posChipStyle(pos: string): React.CSSProperties {
  if (pos === "support")
    return { color: MAPLE_COLORS.green, borderColor: MAPLE_COLORS.green }
  if (pos === "oppose")
    return { color: MAPLE_COLORS.danger, borderColor: MAPLE_COLORS.danger }
  return {
    color: MAPLE_COLORS.textMuted,
    borderColor: MAPLE_COLORS.borderDefault
  }
}
