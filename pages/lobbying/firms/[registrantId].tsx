import React from "react"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import {
  useLobbyingRegistrantsByEntityName,
  useLobbyingFilingsForEntityName
} from "components/db/lobbying"
import { LobbyingFilingsTable } from "components/lobbying/LobbyingFilingsTable"
import {
  LobbyingPositionChip,
  normalizePosition
} from "components/lobbying/LobbyingPositionChip"
import { MAPLE_COLORS } from "components/lobbying/chartTheme"
import { LobbyingAttribution } from "components/lobbying/LobbyingAttribution"

function FirmDetail() {
  const { t } = useTranslation("lobbying")
  const { query } = useRouter()

  // URL param is the URL-encoded entityNameNorm
  const entityNameNorm = query.registrantId
    ? decodeURIComponent(query.registrantId as string)
    : ""

  const { result: registrants, status: regStatus } =
    useLobbyingRegistrantsByEntityName(entityNameNorm)
  const {
    result: filings,
    status: filStatus,
    error: filError
  } = useLobbyingFilingsForEntityName(entityNameNorm)

  const loading =
    regStatus === "loading" ||
    regStatus === "not-requested" ||
    filStatus === "loading" ||
    filStatus === "not-requested"

  if (!entityNameNorm) return null

  // Aggregate from all registrant docs for this entity
  const primary = registrants?.[0]
  const years = [...new Set(registrants?.map(r => r.year) ?? [])].sort(
    (a, b) => b - a
  )
  const allClients = [
    ...new Map(
      (registrants ?? [])
        .flatMap(r => r.clients)
        .map(c => [c.clientNameNorm, c])
    ).values()
  ].sort((a, b) => a.clientNameNorm.localeCompare(b.clientNameNorm))

  const allDisclosureUrls = [
    ...new Set((registrants ?? []).flatMap(r => r.disclosureUrls))
  ]

  const positionCounts = { support: 0, oppose: 0, neutral: 0, none: 0 }
  for (const f of filings ?? []) positionCounts[normalizePosition(f.position)]++

  return (
    <Container>
      <Row className="mt-4 mb-1">
        <Col>
          <a
            href="/lobbying/firms"
            style={{ color: MAPLE_COLORS.textMuted, fontSize: 13 }}
          >
            ← {t("titles.firms")}
          </a>
          <h1 className="mt-2">{primary?.entityName ?? entityNameNorm}</h1>
          <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 14 }}>
            {primary?.regType} &nbsp;·&nbsp;{" "}
            {years.length === 1
              ? years[0]
              : `${years[years.length - 1]}–${years[0]}`}
            &nbsp;·&nbsp; {filings?.length ?? "—"}{" "}
            {t("fields.filings").toLowerCase()}
          </p>
        </Col>
      </Row>

      {loading && (
        <p style={{ color: MAPLE_COLORS.textMuted }}>{t("loading")}</p>
      )}
      {filStatus === "error" && (
        <p style={{ color: MAPLE_COLORS.danger }}>Error: {filError?.message}</p>
      )}

      {!loading && (
        <Row className="mt-2">
          {/* Left: filings */}
          <Col md={8}>
            <h5 style={sectionHeadStyle}>{t("sections.bills")}</h5>
            <LobbyingFilingsTable
              filings={filings ?? []}
              showBill
              showClient
              showFirm={false}
              showAmount
            />
          </Col>

          {/* Right: clients + disclosure links */}
          <Col md={4}>
            <h5 style={sectionHeadStyle}>{t("sections.clients")}</h5>
            {allClients.length === 0 ? (
              <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 13 }}>—</p>
            ) : (
              <ul style={{ paddingLeft: "1.25rem", fontSize: 13 }}>
                {allClients.map(c => (
                  <li
                    key={c.clientNameNorm}
                    style={{ marginBottom: "0.35rem" }}
                  >
                    <a
                      href={`/lobbying/clients/${encodeURIComponent(
                        c.clientNameNorm
                      )}`}
                      style={{ color: MAPLE_COLORS.primary }}
                    >
                      {c.clientName}
                    </a>
                    {c.compensation != null && (
                      <span
                        style={{ color: MAPLE_COLORS.textMuted, fontSize: 12 }}
                      >
                        {" "}
                        (
                        {c.compensation.toLocaleString("en-US", {
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

            {allDisclosureUrls.length > 0 && (
              <>
                <h5 style={{ ...sectionHeadStyle, marginTop: "1.5rem" }}>
                  Disclosures
                </h5>
                <ul style={{ paddingLeft: "1.25rem", fontSize: 12 }}>
                  {allDisclosureUrls.map((url, i) => (
                    <li key={i} style={{ marginBottom: "0.35rem" }}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: MAPLE_COLORS.primary }}
                      >
                        Disclosure {i + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
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
  )
}

export default createPage({
  titleI18nKey: "titles.lobbying",
  Page: FirmDetail
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
