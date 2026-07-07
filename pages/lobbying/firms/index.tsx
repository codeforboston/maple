import React, { useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import { useLobbyingAllRegistrants } from "components/db/lobbying"
import { MAPLE_COLORS } from "components/lobbying/chartTheme"
import type { LobbyingRegistrant } from "functions/src/lobbying/types"

type FirmRow = {
  entityName: string
  entityNameNorm: string
  registrantId: string
  regType: string
  years: number[]
  clientCount: number
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
        clientCount: 0
      })
    }
    const row = map.get(r.entityNameNorm)!
    if (!row.years.includes(r.year)) row.years.push(r.year)
    row.clientCount += r.clients.length
  }
  for (const row of map.values()) row.years.sort((a, b) => b - a)
  return [...map.values()].sort((a, b) =>
    a.entityNameNorm.localeCompare(b.entityNameNorm)
  )
}

function LobbyingFirmsTable() {
  const { t } = useTranslation("lobbying")
  const [regTypeFilter, setRegTypeFilter] = useState<
    "all" | "Lobbyist" | "Employer"
  >("all")
  const [search, setSearch] = useState("")

  const { result: registrants, status, error } = useLobbyingAllRegistrants()
  const firms = useMemo(() => groupByFirm(registrants), [registrants])

  const filtered = useMemo(() => {
    return firms.filter(f => {
      if (regTypeFilter !== "all" && f.regType !== regTypeFilter) return false
      if (search && !f.entityName.toLowerCase().includes(search.toLowerCase()))
        return false
      return true
    })
  }, [firms, regTypeFilter, search])

  return (
    <>
      <div style={filterRowStyle}>
        <select
          value={regTypeFilter}
          onChange={e =>
            setRegTypeFilter(e.target.value as typeof regTypeFilter)
          }
          style={selectStyle}
        >
          <option value="all">All types</option>
          <option value="Lobbyist">Lobbyist</option>
          <option value="Employer">Employer</option>
        </select>
        <input
          type="search"
          placeholder={t("filters.search")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...selectStyle, minWidth: 220, cursor: "text" }}
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
            {filtered.length} {t("sections.firms").toLowerCase()}
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadStyle}>
                  <th style={thStyle}>{t("fields.firmName")}</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Sessions</th>
                  <th style={thStyle}>{t("fields.clients")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

function LobbyingFirmsPage() {
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
          <h1 className="mt-2">{t("titles.firms")}</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <LobbyingFirmsTable />
        </Col>
      </Row>
    </Container>
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
  background: MAPLE_COLORS.surfaceBase
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
