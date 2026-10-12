import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import {
  FirmRegistration,
  useLobbyingFirmSummary,
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
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"
import { usePagination } from "components/lobbying/usePagination"
import { LobbyingPaginationBar } from "components/lobbying/LobbyingPaginationBar"
import { SosSourceLink } from "components/lobbying/SosSourceLink"
import { regTypeLabel } from "components/lobbying/regTypeLabel"

const PAGE_SIZE = 25

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
  const { result: summary, status: sumStatus } =
    useLobbyingFirmSummary(entityNameNorm)

  const loading =
    regStatus === "loading" ||
    regStatus === "not-requested" ||
    sumStatus === "loading" ||
    sumStatus === "not-requested" ||
    filStatus === "loading" ||
    filStatus === "not-requested"

  const sortedFilings = useMemo(
    () =>
      [...(filings ?? [])].sort(
        (a, b) =>
          b.year - a.year || (a.billId ?? "").localeCompare(b.billId ?? "")
      ),
    [filings]
  )

  const { page, setPage, pageItems, totalPages, totalItems } = usePagination(
    sortedFilings,
    PAGE_SIZE
  )

  useEffect(() => {
    setPage(1)
  }, [entityNameNorm, setPage])

  const totalCompensation = useMemo(() => {
    let sum = 0
    for (const r of registrants ?? []) {
      for (const c of r.clients) {
        if (c.compensation != null) sum += c.compensation
      }
    }
    return sum
  }, [registrants])

  if (!entityNameNorm) return null

  // Aggregate from all registrant docs for this entity, plus its registrations
  // (which also cover lobbyists whose employer files their disclosures).
  const primary = registrants?.[0]
  const name = primary?.entityName ?? summary?.entityName ?? entityNameNorm
  const regType = primary?.regType ?? summary?.regType
  const years = [
    ...new Set([
      ...(registrants?.map(r => r.year) ?? []),
      ...(summary?.years ?? [])
    ])
  ].sort((a, b) => b - a)
  const registrations = summary?.registrations ?? []
  const employers = partiesByName(registrations, "employers")
  const registeredLobbyists = partiesByName(registrations, "lobbyists")
  const filesThroughEmployer =
    summary?.hasFilings === false && (filings?.length ?? 0) === 0
  const allClients = [
    ...new Map(
      (registrants ?? [])
        .flatMap(r => r.clients)
        .map(c => [c.clientNameNorm, c])
    ).values()
  ].sort((a, b) => a.clientNameNorm.localeCompare(b.clientNameNorm))

  const lobbyists = [
    ...new Set((registrants ?? []).flatMap(r => r.lobbyists ?? []))
  ].sort((a, b) => a.localeCompare(b))

  // One entry per URL, labeled with the reporting period of the registrant
  // doc it came from (when known — older, not-yet-reprocessed docs may not
  // have one, so this falls back to just the year). Sorted most-recent-first.
  const allDisclosures = [
    ...new Map(
      (registrants ?? []).flatMap(r =>
        r.disclosureUrls.map(url => [
          url,
          {
            url,
            periodStart: r.periodStart,
            periodEnd: r.periodEnd,
            year: r.year
          }
        ])
      )
    ).values()
  ].sort((a, b) => (b.periodStart ?? "").localeCompare(a.periodStart ?? ""))

  const positionCounts = { support: 0, oppose: 0, neutral: 0, none: 0 }
  for (const f of filings ?? []) positionCounts[normalizePosition(f.position)]++

  return (
    <>
      <LobbyingSubnav />
      <Container>
        <Row className="mt-4 mb-1">
          <Col>
            <a
              href="/lobbying/firms"
              style={{ color: MAPLE_COLORS.textMuted, fontSize: 13 }}
            >
              ← {t("titles.firms")}
            </a>
            <h1 className="mt-2">{name}</h1>
            <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 14 }}>
              {regType && regTypeLabel(regType, t)}
              {years.length > 0 && (
                <>
                  &nbsp;·&nbsp;{" "}
                  {years.length === 1
                    ? years[0]
                    : `${years[years.length - 1]}–${years[0]}`}
                </>
              )}
              {!filesThroughEmployer && (
                <>
                  &nbsp;·&nbsp; {filings?.length ?? "—"}{" "}
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
                  {t("misc.total")}
                </>
              )}
              {summary?.sourceUrl && (
                <>
                  &nbsp;·&nbsp; <SosSourceLink href={summary.sourceUrl} />
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
            {/* Left: filings */}
            <Col md={8}>
              <h5 style={sectionHeadStyle}>{t("sections.bills")}</h5>
              {filesThroughEmployer && (
                <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 14 }}>
                  {t("misc.filesThroughFirm", { name })}
                </p>
              )}
              {!filesThroughEmployer && (
                <>
                  <LobbyingFilingsTable
                    filings={pageItems}
                    showBill
                    showClient
                    showFirm={false}
                    showAmount
                  />
                  <LobbyingPaginationBar
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={PAGE_SIZE}
                    onPage={setPage}
                  />
                </>
              )}
            </Col>

            {/* Right: clients + disclosure links */}
            <Col md={4}>
              {/* A lobbyist whose employer files has no clients of their own;
                  the note on the left explains where to look instead. */}
              {(allClients.length > 0 || !filesThroughEmployer) && (
                <h5 style={sectionHeadStyle}>{t("sections.clients")}</h5>
              )}
              {allClients.length === 0 ? (
                !filesThroughEmployer && (
                  <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 13 }}>
                    —
                  </p>
                )
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
                          style={{
                            color: MAPLE_COLORS.textMuted,
                            fontSize: 12
                          }}
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

              {employers.length > 0 && (
                <>
                  <h5 style={{ ...sectionHeadStyle, marginTop: "1.5rem" }}>
                    {t("sections.employers")}
                  </h5>
                  <PartyList parties={employers} />
                </>
              )}

              {(registeredLobbyists.length > 0 || lobbyists.length > 0) && (
                <>
                  <h5 style={{ ...sectionHeadStyle, marginTop: "1.5rem" }}>
                    {t("sections.firmLobbyists")}
                  </h5>
                  {registeredLobbyists.length > 0 ? (
                    <PartyList parties={registeredLobbyists} />
                  ) : (
                    <ul style={{ paddingLeft: "1.25rem", fontSize: 13 }}>
                      {lobbyists.map(lobbyist => (
                        <li key={lobbyist} style={{ marginBottom: "0.35rem" }}>
                          {lobbyist}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {registrations.some(r => r.sourceUrl) && (
                <>
                  <h5 style={{ ...sectionHeadStyle, marginTop: "1.5rem" }}>
                    {t("sections.registrations")}
                  </h5>
                  <ul style={{ paddingLeft: "1.25rem", fontSize: 12 }}>
                    {registrations
                      .filter(r => r.sourceUrl)
                      .map(r => (
                        <li key={r.year} style={{ marginBottom: "0.35rem" }}>
                          <SosSourceLink
                            href={r.sourceUrl}
                            label={t("misc.registrationYear", { year: r.year })}
                          />
                        </li>
                      ))}
                  </ul>
                </>
              )}

              {allDisclosures.length > 0 && (
                <>
                  <h5 style={{ ...sectionHeadStyle, marginTop: "1.5rem" }}>
                    {t("misc.disclosures")}
                  </h5>
                  <ul style={{ paddingLeft: "1.25rem", fontSize: 12 }}>
                    {allDisclosures.map((d, i) => (
                      <li key={d.url} style={{ marginBottom: "0.35rem" }}>
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: MAPLE_COLORS.primary }}
                        >
                          {formatDisclosureLabel(d, t, i)}
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
    </>
  )
}

type Party = {
  name: string
  nameNorm: string | null
  hasProfile: boolean
  years: number[]
}

// One entry per person or entity across all registration years, most recent
// first.
function partiesByName(
  registrations: FirmRegistration[],
  key: "employers" | "lobbyists"
): Party[] {
  const byKey = new Map<string, Party>()
  for (const r of registrations) {
    for (const p of r[key]) {
      const k = p.nameNorm || p.name
      const entry = byKey.get(k) ?? { ...p, years: [] }
      if (!entry.years.includes(r.year)) entry.years.push(r.year)
      entry.hasProfile = entry.hasProfile || p.hasProfile
      byKey.set(k, entry)
    }
  }
  return [...byKey.values()]
    .map(p => ({ ...p, years: p.years.sort((a, b) => b - a) }))
    .sort((a, b) => b.years[0] - a.years[0] || a.name.localeCompare(b.name))
}

function PartyList({ parties }: { parties: Party[] }) {
  return (
    <ul style={{ paddingLeft: "1.25rem", fontSize: 13 }}>
      {parties.map(p => (
        <li key={p.nameNorm || p.name} style={{ marginBottom: "0.35rem" }}>
          {p.hasProfile && p.nameNorm ? (
            <a
              href={`/lobbying/firms/${encodeURIComponent(p.nameNorm)}`}
              style={{ color: MAPLE_COLORS.primary }}
            >
              {p.name}
            </a>
          ) : (
            p.name
          )}{" "}
          <span style={{ color: MAPLE_COLORS.textMuted, fontSize: 12 }}>
            (
            {p.years.length === 1
              ? p.years[0]
              : `${p.years[p.years.length - 1]}–${p.years[0]}`}
            )
          </span>
        </li>
      ))}
    </ul>
  )
}

// Older registrant docs (not yet reprocessed with a parsed reporting period)
// fall back to just the year, then to a plain numbered label as a last resort.
function formatDisclosureLabel(
  d: { periodStart?: string | null; periodEnd?: string | null; year: number },
  t: (key: string, opts?: Record<string, unknown>) => string,
  index: number
): string {
  if (d.periodStart && d.periodEnd) {
    return `${formatIsoDate(d.periodStart)} – ${formatIsoDate(d.periodEnd)}`
  }
  if (d.year) return `${t("fields.year")} ${d.year}`
  return t("misc.disclosureLink", { number: index + 1 })
}

function formatIsoDate(iso: string): string {
  const [y, m, day] = iso.split("-").map(Number)
  return `${m}/${day}/${y}`
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
