import React, { useMemo } from "react"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import {
  useLobbyingFilingsForClient,
  useLobbyingAllRegistrants
} from "components/db/lobbying"
import { LobbyingFilingsTable } from "components/lobbying/LobbyingFilingsTable"
import {
  LobbyingPositionChip,
  normalizePosition
} from "components/lobbying/LobbyingPositionChip"
import { MAPLE_COLORS } from "components/lobbying/chartTheme"
import { LobbyingAttribution } from "components/lobbying/LobbyingAttribution"
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"
import type { LobbyingRegistrant } from "functions/src/lobbying/types"

function findFirmsForClient(
  registrants: LobbyingRegistrant[] | undefined,
  clientNameNorm: string
): Array<{
  entityName: string
  entityNameNorm: string
  compensation: number | null
}> {
  if (!registrants) return []
  const map = new Map<
    string,
    { entityName: string; entityNameNorm: string; compensation: number | null }
  >()
  for (const r of registrants) {
    const match = r.clients.find(c => c.clientNameNorm === clientNameNorm)
    if (!match) continue
    if (!map.has(r.entityNameNorm)) {
      map.set(r.entityNameNorm, {
        entityName: r.entityName,
        entityNameNorm: r.entityNameNorm,
        compensation: null
      })
    }
    const entry = map.get(r.entityNameNorm)!
    if (match.compensation != null) {
      entry.compensation = (entry.compensation ?? 0) + match.compensation
    }
  }
  return [...map.values()].sort((a, b) =>
    a.entityNameNorm.localeCompare(b.entityNameNorm)
  )
}

function ClientDetail() {
  const { t } = useTranslation("lobbying")
  const { query } = useRouter()

  const clientNameNorm = query.clientSlug
    ? decodeURIComponent(query.clientSlug as string)
    : ""

  const {
    result: filings,
    status: filStatus,
    error: filError
  } = useLobbyingFilingsForClient(clientNameNorm)
  const { result: registrants, status: regStatus } = useLobbyingAllRegistrants()

  const firms = useMemo(
    () => findFirmsForClient(registrants, clientNameNorm),
    [registrants, clientNameNorm]
  )

  const positionCounts = useMemo(() => {
    const counts = { support: 0, oppose: 0, neutral: 0, none: 0 }
    for (const f of filings ?? []) counts[normalizePosition(f.position)]++
    return counts
  }, [filings])

  const totalCompensation = useMemo(
    () =>
      firms.reduce(
        (sum, f) => (f.compensation != null ? sum + f.compensation : sum),
        0
      ),
    [firms]
  )

  const years = useMemo(
    () => [...new Set((filings ?? []).map(f => f.year))].sort((a, b) => b - a),
    [filings]
  )

  const loading =
    filStatus === "loading" ||
    filStatus === "not-requested" ||
    regStatus === "loading" ||
    regStatus === "not-requested"

  const displayName = filings?.[0]?.clientName ?? clientNameNorm

  if (!clientNameNorm) return null

  return (
    <>
      <LobbyingSubnav />
      <Container>
        <Row className="mt-4 mb-1">
          <Col>
            <a
              href="/lobbying/clients"
              style={{ color: MAPLE_COLORS.textMuted, fontSize: 13 }}
            >
              ← {t("titles.clients")}
            </a>
            <h1 className="mt-2">{displayName}</h1>
            <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 14 }}>
              {years.length > 0 &&
                (years.length === 1
                  ? years[0]
                  : `${years[years.length - 1]}–${years[0]}`)}
              {filings && filings.length > 0 && (
                <>
                  &nbsp;·&nbsp; {filings.length}{" "}
                  {t("fields.filings").toLowerCase()}
                </>
              )}
              {totalCompensation > 0 && (
                <>
                  &nbsp;·&nbsp;{" "}
                  {totalCompensation.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0
                  })}{" "}
                  total
                </>
              )}
            </p>
          </Col>
        </Row>

        {loading && (
          <p style={{ color: MAPLE_COLORS.textMuted }}>{t("loading")}</p>
        )}
        {filStatus === "error" && (
          <p style={{ color: MAPLE_COLORS.danger }}>
            Error: {filError?.message}
          </p>
        )}

        {!loading && (
          <Row className="mt-2">
            <Col md={8}>
              <h5 style={sectionHeadStyle}>{t("sections.bills")}</h5>
              <LobbyingFilingsTable
                filings={filings ?? []}
                showBill
                showClient={false}
                showFirm
                showAmount
              />
            </Col>

            <Col md={4}>
              <h5 style={sectionHeadStyle}>Firms</h5>
              {firms.length === 0 ? (
                <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 13 }}>—</p>
              ) : (
                <ul style={{ paddingLeft: "1.25rem", fontSize: 13 }}>
                  {firms.map(f => (
                    <li
                      key={f.entityNameNorm}
                      style={{ marginBottom: "0.35rem" }}
                    >
                      <a
                        href={`/lobbying/firms/${encodeURIComponent(
                          f.entityNameNorm
                        )}`}
                        style={{ color: MAPLE_COLORS.primary }}
                      >
                        {f.entityName}
                      </a>
                      {f.compensation != null && (
                        <span
                          style={{
                            color: MAPLE_COLORS.textMuted,
                            fontSize: 12
                          }}
                        >
                          {" "}
                          (
                          {f.compensation.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0
                          })}
                          )
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {(filings?.length ?? 0) > 0 && (
                <>
                  <h5 style={{ ...sectionHeadStyle, marginTop: "1.5rem" }}>
                    {t("filters.position")}
                  </h5>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                      fontSize: 13
                    }}
                  >
                    {(["support", "oppose", "neutral"] as const).map(
                      pos =>
                        positionCounts[pos] > 0 && (
                          <div
                            key={pos}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem"
                            }}
                          >
                            <LobbyingPositionChip position={pos} />
                            <span style={{ color: MAPLE_COLORS.textMuted }}>
                              {positionCounts[pos]}
                            </span>
                          </div>
                        )
                    )}
                  </div>
                </>
              )}
            </Col>
          </Row>
        )}
        <LobbyingAttribution className="mt-3" />
      </Container>
    </>
  )
}

export default createPage({
  titleI18nKey: "titles.lobbying",
  Page: ClientDetail
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

const sectionHeadStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: MAPLE_COLORS.textMuted,
  marginBottom: "0.6rem"
}
