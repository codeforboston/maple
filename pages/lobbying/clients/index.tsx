import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import { useLobbyingAllRegistrants } from "components/db/lobbying"
import { MAPLE_COLORS } from "components/lobbying/chartTheme"
import { LobbyingAttribution } from "components/lobbying/LobbyingAttribution"
import { usePagination } from "components/lobbying/usePagination"
import { LobbyingPaginationBar } from "components/lobbying/LobbyingPaginationBar"
import type { LobbyingRegistrant } from "functions/src/lobbying/types"
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"

const LEGACY_TOTAL_CLIENT = "_total_salary_"
const PAGE_SIZE = 50

type ClientSortKey = "name" | "compensation" | "firms"
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
  sortKey: ClientSortKey
  current: ClientSortKey
  dir: SortDir
  onSort: (k: ClientSortKey) => void
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

type ClientRow = {
  clientName: string
  clientNameNorm: string
  totalCompensation: number | null
  registrantCount: number
}

function deriveClients(
  registrants: LobbyingRegistrant[] | undefined
): ClientRow[] {
  if (!registrants) return []
  const map = new Map<string, ClientRow>()
  for (const r of registrants) {
    for (const c of r.clients) {
      if (
        !c.clientNameNorm ||
        c.clientNameNorm === LEGACY_TOTAL_CLIENT ||
        c.clientName === LEGACY_TOTAL_CLIENT
      )
        continue
      if (!map.has(c.clientNameNorm)) {
        map.set(c.clientNameNorm, {
          clientName: c.clientName,
          clientNameNorm: c.clientNameNorm,
          totalCompensation: null,
          registrantCount: 0
        })
      }
      const row = map.get(c.clientNameNorm)!
      row.registrantCount++
      if (c.compensation != null) {
        row.totalCompensation = (row.totalCompensation ?? 0) + c.compensation
      }
    }
  }
  return [...map.values()]
}

function LobbyingClientsTable() {
  const { t } = useTranslation("lobbying")
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<ClientSortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  function handleSort(key: ClientSortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "name" ? "asc" : "desc")
    }
  }

  const { result: registrants, status, error } = useLobbyingAllRegistrants()
  const clients = useMemo(() => deriveClients(registrants), [registrants])

  const filtered = useMemo(
    () =>
      search
        ? clients.filter(c =>
            c.clientName.toLowerCase().includes(search.toLowerCase())
          )
        : clients,
    [clients, search]
  )

  const sorted = useMemo(() => {
    const mul = sortDir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "compensation":
          return (
            mul * ((a.totalCompensation ?? -1) - (b.totalCompensation ?? -1))
          )
        case "firms":
          return mul * (a.registrantCount - b.registrantCount)
        default:
          return mul * a.clientNameNorm.localeCompare(b.clientNameNorm)
      }
    })
  }, [filtered, sortKey, sortDir])

  const { page, setPage, pageItems, totalPages, totalItems } = usePagination(
    sorted,
    PAGE_SIZE
  )

  useEffect(() => {
    setPage(1)
  }, [search, sortKey, sortDir, setPage])

  return (
    <>
      <div style={filterRowStyle}>
        <input
          type="search"
          placeholder={t("filters.search")}
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
        <p style={{ color: MAPLE_COLORS.danger }}>{error?.message}</p>
      ) : (
        <>
          <p
            style={{
              color: MAPLE_COLORS.textMuted,
              fontSize: 13,
              marginBottom: "0.5rem"
            }}
          >
            {totalItems} {t("sections.clients").toLowerCase()}
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadStyle}>
                  <SortTh
                    label={t("fields.clientName")}
                    sortKey="name"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortTh
                    label="Firms"
                    sortKey="firms"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortTh
                    label={t("fields.amount")}
                    sortKey="compensation"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                    style={{ textAlign: "right" }}
                  />
                </tr>
              </thead>
              <tbody>
                {pageItems.map(c => (
                  <tr key={c.clientNameNorm} style={trStyle}>
                    <td style={tdStyle}>
                      <a
                        href={`/lobbying/clients/${encodeURIComponent(
                          c.clientNameNorm
                        )}`}
                        style={{ color: MAPLE_COLORS.primary, fontWeight: 600 }}
                      >
                        {c.clientName}
                      </a>
                    </td>
                    <td style={{ ...tdStyle, color: MAPLE_COLORS.textMuted }}>
                      {c.registrantCount}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                        color: MAPLE_COLORS.textMuted
                      }}
                    >
                      {c.totalCompensation != null
                        ? c.totalCompensation.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0
                          })
                        : "—"}
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

function LobbyingClientsPage() {
  const { t } = useTranslation("lobbying")
  return (
    <>
      <LobbyingSubnav />
      <Container>
        <Row className="mt-4 mb-3">
          <Col>
            <h1>{t("titles.clients")}</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <LobbyingClientsTable />
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
  Page: LobbyingClientsPage
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
const searchStyle: React.CSSProperties = {
  ...selectStyle,
  minWidth: 260,
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
