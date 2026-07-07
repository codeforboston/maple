import React, { useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import { useLobbyingAllRegistrants } from "components/db/lobbying"
import { MAPLE_COLORS } from "components/lobbying/chartTheme"
import type { LobbyingRegistrant } from "functions/src/lobbying/types"

const LEGACY_TOTAL_CLIENT = "_total_salary_"

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
      if (!c.clientNameNorm || c.clientNameNorm === LEGACY_TOTAL_CLIENT)
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
  return [...map.values()].sort((a, b) =>
    a.clientNameNorm.localeCompare(b.clientNameNorm)
  )
}

function LobbyingClientsTable() {
  const { t } = useTranslation("lobbying")
  const [search, setSearch] = useState("")

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

  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
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
            {filtered.length} {t("sections.clients").toLowerCase()}
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadStyle}>
                  <th style={thStyle}>{t("fields.clientName")}</th>
                  <th style={thStyle}>Firms</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>
                    {t("fields.amount")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
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
        </>
      )}
    </>
  )
}

function LobbyingClientsPage() {
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
          <h1 className="mt-2">{t("titles.clients")}</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <LobbyingClientsTable />
        </Col>
      </Row>
    </Container>
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

const searchStyle: React.CSSProperties = {
  padding: "0.35rem 0.65rem",
  border: `1px solid ${MAPLE_COLORS.borderDefault}`,
  borderRadius: 6,
  fontSize: 14,
  color: MAPLE_COLORS.textBody,
  background: MAPLE_COLORS.surfaceBase,
  minWidth: 260
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
