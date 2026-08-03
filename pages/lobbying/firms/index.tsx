import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import {
  useLobbyingAllRegistrants,
  useLobbyingEntityFilingCounts
} from "components/db/lobbying"
import { MAPLE_COLORS } from "components/lobbying/chartTheme"
import { LobbyingAttribution } from "components/lobbying/LobbyingAttribution"
import { usePagination } from "components/lobbying/usePagination"
import { LobbyingPaginationBar } from "components/lobbying/LobbyingPaginationBar"
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"
import type { LobbyingRegistrant } from "functions/src/lobbying/types"

const PAGE_SIZE = 50

type FirmSortKey = "name" | "clients" | "sessions" | "filings"
type SortDir = "asc" | "desc"

function SortTh({
  label,
  sortKey,
  current,
  dir,
  onSort,
  style
}: {
  label: string
  sortKey: FirmSortKey
  current: FirmSortKey
  dir: SortDir
  onSort: (k: FirmSortKey) => void
  style?: React.CSSProperties
}) {
  const active = sortKey === current
  return (
    <th
      onClick={() => onSort(sortKey)}
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

type FirmRow = {
  entityName: string
  entityNameNorm: string
  registrantId: string
  regType: string
  years: number[]
  clientCount: number
  totalFilings: number | undefined
}

function groupByFirm(registrants: LobbyingRegistrant[] | undefined): FirmRow[] {
  if (!registrants) return []
  const map = new Map<string, FirmRow>()
  for (const r of registrants) {
    if (!map.has(r.entityNameNorm)) {
      map.set(r.entityNameNorm, {
        entityName: r.entityName,
        entityNameNorm: r.entityNameNorm,
        registrantId: r.registrantId,
        regType: r.regType,
        years: [],
        clientCount: 0,
        totalFilings: undefined
      })
    }
    const row = map.get(r.entityNameNorm)!
    if (!row.years.includes(r.year)) row.years.push(r.year)
    row.clientCount += r.clients.length
  }
  for (const row of map.values()) row.years.sort((a, b) => b - a)
  return [...map.values()]
}

function LobbyingFirmsTable() {
  const { t } = useTranslation("lobbying")
  const [regTypeFilter, setRegTypeFilter] = useState<
    "all" | "Lobbyist" | "Employer"
  >("all")
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<FirmSortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  function handleSort(key: FirmSortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "name" ? "asc" : "desc")
    }
  }

  const { result: registrants, status, error } = useLobbyingAllRegistrants()
  const { result: filCounts } = useLobbyingEntityFilingCounts()
  const firms = useMemo(() => groupByFirm(registrants), [registrants])
  const firmsWithCounts = useMemo(
    () =>
      filCounts
        ? firms.map(f => ({ ...f, totalFilings: filCounts[f.entityNameNorm] }))
        : firms,
    [firms, filCounts]
  )

  const filtered = useMemo(() => {
    return firmsWithCounts.filter(f => {
      if (regTypeFilter !== "all" && f.regType !== regTypeFilter) return false
      if (search && !f.entityName.toLowerCase().includes(search.toLowerCase()))
        return false
      return true
    })
  }, [firmsWithCounts, regTypeFilter, search])

  const sorted = useMemo(() => {
    const mul = sortDir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "clients":
          return mul * (a.clientCount - b.clientCount)
        case "sessions":
          return mul * (a.years.length - b.years.length)
        case "filings":
          return mul * ((a.totalFilings ?? -1) - (b.totalFilings ?? -1))
        default:
          return mul * a.entityNameNorm.localeCompare(b.entityNameNorm)
      }
    })
  }, [filtered, sortKey, sortDir])

  const { page, setPage, pageItems, totalPages, totalItems } = usePagination(
    sorted,
    PAGE_SIZE
  )

  useEffect(() => {
    setPage(1)
  }, [regTypeFilter, search, sortKey, sortDir, setPage])

  return (
    <>
      <div style={filterRowStyle}>
        <select
          value={regTypeFilter}
          onChange={e =>
            setRegTypeFilter(e.target.value as typeof regTypeFilter)
          }
          style={selectStyle}
          aria-label={t("filters.allTypes")}
        >
          <option value="all">{t("registrantType.all")}</option>
          <option value="Lobbyist">{t("registrantType.lobbyist")}</option>
          <option value="Employer">{t("registrantType.employer")}</option>
        </select>

        <input
          type="search"
          placeholder={t("filters.search")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...selectStyle, minWidth: 220, cursor: "text" }}
          aria-label={t("filters.search")}
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
      ) : (
        <>
          <p
            style={{
              color: MAPLE_COLORS.textMuted,
              fontSize: 13,
              marginBottom: "0.5rem"
            }}
          >
            {totalItems} {t("sections.firms").toLowerCase()}
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadStyle}>
                  <SortTh
                    label={t("fields.firmName")}
                    sortKey="name"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <th style={thStyle}>{t("fields.type")}</th>
                  <SortTh
                    label={t("fields.sessions")}
                    sortKey="sessions"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortTh
                    label={t("fields.clients")}
                    sortKey="clients"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortTh
                    label={t("fields.filings")}
                    sortKey="filings"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {pageItems.map(f => (
                  <tr key={f.entityNameNorm} style={trStyle}>
                    <td style={tdStyle}>
                      <a
                        href={`/lobbying/firms/${encodeURIComponent(
                          f.entityNameNorm
                        )}`}
                        style={{ color: MAPLE_COLORS.primary, fontWeight: 600 }}
                      >
                        {f.entityName}
                      </a>
                    </td>
                    <td style={tdStyle}>{f.regType}</td>
                    <td
                      style={{
                        ...tdStyle,
                        color: MAPLE_COLORS.textMuted,
                        fontSize: 12
                      }}
                    >
                      {f.years.length === 1
                        ? f.years[0]
                        : `${f.years[f.years.length - 1]}–${f.years[0]}`}
                    </td>
                    <td style={tdStyle}>{f.clientCount}</td>
                    <td style={{ ...tdStyle, color: MAPLE_COLORS.textMuted }}>
                      {f.totalFilings !== undefined ? f.totalFilings : "—"}
                    </td>
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
        </>
      )}
    </>
  )
}

function LobbyingFirmsPage() {
  const { t } = useTranslation("lobbying")
  return (
    <>
      <LobbyingSubnav />
      <Container>
        <Row className="mt-4 mb-3">
          <Col>
            <h1>{t("titles.firms")}</h1>
            <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 14 }}>
              {t("explainers.firms")}
            </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <LobbyingFirmsTable />
          </Col>
        </Row>
        <Row>
          <Col>
            <LobbyingAttribution />
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default createPage({
  titleI18nKey: "titles.lobbying",
  Page: LobbyingFirmsPage
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "lobbying"
])

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
