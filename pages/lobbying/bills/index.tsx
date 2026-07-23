import React, { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "next-i18next"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import { useLobbyingBillRows, type BillRow } from "components/db/lobbying"
import { MAPLE_COLORS, POSITION_COLORS } from "components/lobbying/chartTheme"
import { LobbyingAttribution } from "components/lobbying/LobbyingAttribution"
import { usePagination } from "components/lobbying/usePagination"
import { LobbyingPaginationBar } from "components/lobbying/LobbyingPaginationBar"
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"
import styles from "components/lobbying/lobbying.module.css"

const ALL_COURTS = [194, 193, 192, 191, 190, 189, 188, 187, 186, 185, 184]
const PAGE_SIZE = 50

function courtYears(court: number): string {
  const start = 2 * (court - 184) + 2005
  return `${start}–${String(start + 1).slice(2)}`
}

type BillSortKey =
  | "id"
  | "filings"
  | "support"
  | "oppose"
  | "neutral"
  | "clients"
  | "lobbyists"
  | "pct_support"
  | "pct_oppose"
  | "pct_neutral"
type SortDir = "asc" | "desc"

const PCT_CYCLE = ["pct_support", "pct_oppose", "pct_neutral"] as const
type PctSortKey = (typeof PCT_CYCLE)[number]

function isPctKey(k: BillSortKey): k is PctSortKey {
  return (PCT_CYCLE as readonly string[]).includes(k)
}

const PCT_LABEL: Record<PctSortKey, string> = {
  pct_support: "% Support",
  pct_oppose: "% Oppose",
  pct_neutral: "% Neutral"
}

// ── Session multiselect ───────────────────────────────────────────────────────

function CourtMultiSelect({
  selected,
  onChange
}: {
  selected: number[]
  onChange: (courts: number[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const allSelected = selected.length === ALL_COURTS.length
  const label = allSelected
    ? "All sessions"
    : selected.length === 1
    ? `Session ${selected[0]} (${courtYears(selected[0])})`
    : `${selected.length} sessions`

  function toggleAll() {
    onChange(allSelected ? [ALL_COURTS[0]] : [...ALL_COURTS])
  }

  function toggleCourt(court: number) {
    if (selected.includes(court)) {
      const next = selected.filter(c => c !== court)
      onChange(next.length ? next : [court])
    } else {
      onChange([...selected, court])
    }
  }

  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [open])

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          ...selectStyle,
          display: "flex",
          alignItems: "center",
          gap: 6
        }}
      >
        {label}
        <span style={{ fontSize: 10, color: MAPLE_COLORS.textMuted }}>▾</span>
      </button>
      {open && (
        <div style={dropdownStyle}>
          <label style={checkRowStyle}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              style={{ marginRight: 6 }}
            />
            <strong>All sessions</strong>
          </label>
          <div
            style={{
              borderTop: `1px solid ${MAPLE_COLORS.borderSubtle}`,
              margin: "4px 0"
            }}
          />
          {ALL_COURTS.map(c => (
            <label key={c} style={checkRowStyle}>
              <input
                type="checkbox"
                checked={selected.includes(c)}
                onChange={() => toggleCourt(c)}
                style={{ marginRight: 6 }}
              />
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                Session {c}
              </span>
              <span style={{ color: MAPLE_COLORS.textMuted, marginLeft: 4 }}>
                {courtYears(c)}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Sortable header cell ──────────────────────────────────────────────────────

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
  sortKey: BillSortKey
  current: BillSortKey
  dir: SortDir
  onSort: (k: BillSortKey) => void
  style?: React.CSSProperties
  className?: string
}) {
  const active = sortKey === current
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
      {active && (
        <span style={{ fontSize: 10, marginLeft: 3 }}>
          {dir === "asc" ? "↑" : "↓"}
        </span>
      )}
    </th>
  )
}

// ── Position mini-bar ─────────────────────────────────────────────────────────

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
          style={{
            width: pct(row.support),
            background: POSITION_COLORS.support
          }}
        />
      )}
      {row.oppose > 0 && (
        <div
          style={{ width: pct(row.oppose), background: POSITION_COLORS.oppose }}
        />
      )}
      {row.neutral > 0 && (
        <div
          style={{
            width: pct(row.neutral),
            background: POSITION_COLORS.neutral
          }}
        />
      )}
    </div>
  )
}

// ── Main table component ──────────────────────────────────────────────────────

function LobbyingBillsTable() {
  const { t } = useTranslation("lobbying")
  const [selectedCourts, setSelectedCourts] = useState<number[]>([194])
  const [posFilter, setPosFilter] = useState<
    "all" | "support" | "oppose" | "neutral"
  >("all")
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<BillSortKey>("filings")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  function handleSort(key: BillSortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "id" ? "asc" : "desc")
    }
  }

  function handlePositionsSort() {
    const idx = PCT_CYCLE.indexOf(sortKey as PctSortKey)
    setSortKey(PCT_CYCLE[(idx + 1) % PCT_CYCLE.length])
    setSortDir("desc")
  }

  const { result: allRows, status, error } = useLobbyingBillRows(selectedCourts)

  const multiCourt = selectedCourts.length > 1

  const filtered = useMemo(() => {
    if (!allRows) return []
    return allRows.filter(b => {
      if (posFilter !== "all" && b[posFilter] === 0) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !b.billId.toLowerCase().includes(q) &&
          !b.title.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [allRows, posFilter, search])

  const sorted = useMemo(() => {
    const mul = sortDir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "id":
          return mul * a.billId.localeCompare(b.billId)
        case "support":
          return mul * (a.support - b.support)
        case "oppose":
          return mul * (a.oppose - b.oppose)
        case "neutral":
          return mul * (a.neutral - b.neutral)
        case "clients":
          return mul * (a.clients - b.clients)
        case "lobbyists":
          return mul * (a.lobbyists - b.lobbyists)
        case "pct_support":
          return (
            mul *
            ((a.total ? a.support / a.total : 0) -
              (b.total ? b.support / b.total : 0))
          )
        case "pct_oppose":
          return (
            mul *
            ((a.total ? a.oppose / a.total : 0) -
              (b.total ? b.oppose / b.total : 0))
          )
        case "pct_neutral":
          return (
            mul *
            ((a.total ? a.neutral / a.total : 0) -
              (b.total ? b.neutral / b.total : 0))
          )
        default:
          return mul * (a.total - b.total)
      }
    })
  }, [filtered, sortKey, sortDir])

  const { page, setPage, pageItems, totalPages, totalItems } = usePagination(
    sorted,
    PAGE_SIZE
  )

  useEffect(() => {
    setPage(1)
  }, [selectedCourts, posFilter, search, sortKey, sortDir, setPage])

  return (
    <>
      <div style={filterRowStyle}>
        <CourtMultiSelect
          selected={selectedCourts}
          onChange={setSelectedCourts}
        />

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
          placeholder="Search bill ID or title…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={searchStyle}
        />
      </div>

      {status === "loading" || status === "not-requested" ? (
        <p style={{ color: MAPLE_COLORS.textMuted, padding: "2rem 0" }}>
          {t("loading")}
        </p>
      ) : status === "error" ? (
        <p style={{ color: MAPLE_COLORS.danger, padding: "1rem 0" }}>
          Error: {error?.message}
        </p>
      ) : sorted.length === 0 ? (
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
            {totalItems} {t("sections.bills").toLowerCase()}
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadStyle}>
                  <SortTh
                    label={t("fields.bill")}
                    sortKey="id"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <th style={thStyle} className={styles.mobileHide}>
                    Title
                  </th>
                  {multiCourt && (
                    <th style={thStyle} className={styles.mobileHide}>
                      {t("filters.session")}
                    </th>
                  )}
                  <SortTh
                    label={t("fields.filings")}
                    sortKey="filings"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortTh
                    label="Clients"
                    sortKey="clients"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                    className={styles.mobileHide}
                  />
                  <SortTh
                    label="Firms"
                    sortKey="lobbyists"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                    className={styles.mobileHide}
                  />
                  <SortTh
                    label={t("position.support")}
                    sortKey="support"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                    className={styles.mobileHide}
                  />
                  <SortTh
                    label={t("position.oppose")}
                    sortKey="oppose"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                    className={styles.mobileHide}
                  />
                  <SortTh
                    label={t("position.neutral")}
                    sortKey="neutral"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                    className={styles.mobileHide}
                  />
                  <th
                    onClick={handlePositionsSort}
                    style={{
                      ...thStyle,
                      cursor: "pointer",
                      color: isPctKey(sortKey)
                        ? MAPLE_COLORS.primary
                        : MAPLE_COLORS.textMuted,
                      userSelect: "none"
                    }}
                    title="Click to sort by % support → % oppose → % neutral"
                  >
                    {isPctKey(sortKey)
                      ? PCT_LABEL[sortKey]
                      : t("fields.positions")}
                    {isPctKey(sortKey) && (
                      <span style={{ fontSize: 10, marginLeft: 3 }}>
                        {sortDir === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map(b => {
                  const rowKey = multiCourt
                    ? `${b.court}-${b.billId}`
                    : b.billId
                  return (
                    <tr key={rowKey} style={trStyle}>
                      <td style={tdStyle}>
                        <a
                          href={`/lobbying/bills/${b.court}/${b.billId}`}
                          style={{
                            color: MAPLE_COLORS.primary,
                            fontWeight: 600
                          }}
                        >
                          {b.billId}
                        </a>
                      </td>
                      <td
                        style={{ ...tdStyle, maxWidth: 280 }}
                        className={styles.mobileHide}
                        title={b.title || undefined}
                      >
                        {b.title ? (
                          <span
                            style={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: 12,
                              color: MAPLE_COLORS.textMuted
                            }}
                          >
                            {b.title}
                          </span>
                        ) : null}
                      </td>
                      {multiCourt && (
                        <td style={tdStyle} className={styles.mobileHide}>
                          {b.court}
                        </td>
                      )}
                      <td style={tdStyle}>{b.total}</td>
                      <td style={tdStyle} className={styles.mobileHide}>
                        {b.clients || (
                          <span style={{ color: MAPLE_COLORS.textMuted }}>
                            —
                          </span>
                        )}
                      </td>
                      <td style={tdStyle} className={styles.mobileHide}>
                        {b.lobbyists || (
                          <span style={{ color: MAPLE_COLORS.textMuted }}>
                            —
                          </span>
                        )}
                      </td>
                      <td style={tdStyle} className={styles.mobileHide}>
                        {b.support > 0 && (
                          <span
                            style={{
                              fontSize: 12,
                              color: POSITION_COLORS.support
                            }}
                          >
                            {b.support}
                          </span>
                        )}
                      </td>
                      <td style={tdStyle} className={styles.mobileHide}>
                        {b.oppose > 0 && (
                          <span
                            style={{
                              fontSize: 12,
                              color: POSITION_COLORS.oppose
                            }}
                          >
                            {b.oppose}
                          </span>
                        )}
                      </td>
                      <td style={tdStyle} className={styles.mobileHide}>
                        {b.neutral > 0 && (
                          <span
                            style={{
                              fontSize: 12,
                              color: POSITION_COLORS.neutral
                            }}
                          >
                            {b.neutral}
                          </span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                        <PositionMiniBar row={b} />
                      </td>
                    </tr>
                  )
                })}
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
        </>
      )}

      <LobbyingAttribution />
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function LobbyingBillsPage() {
  const { t } = useTranslation("lobbying")
  return (
    <>
      <LobbyingSubnav />
      <Container>
        <Row className="mt-4 mb-3">
          <Col>
            <h1>{t("titles.bills")}</h1>
            <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 14 }}>
              {t("explainers.bills")}
            </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <LobbyingBillsTable />
          </Col>
        </Row>
      </Container>
    </>
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
  minWidth: 220,
  cursor: "text"
}

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 4px)",
  left: 0,
  zIndex: 200,
  background: MAPLE_COLORS.surfaceBase,
  border: `1px solid ${MAPLE_COLORS.borderDefault}`,
  borderRadius: 8,
  boxShadow: "0 4px 16px rgba(15,23,42,0.10)",
  padding: "6px 0",
  minWidth: 240
}

const checkRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "5px 14px",
  fontSize: 13,
  cursor: "pointer",
  whiteSpace: "nowrap",
  gap: 2
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
