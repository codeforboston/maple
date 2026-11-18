import React, { useEffect, useId, useMemo, useState } from "react"
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
import type { LobbyingFiling } from "functions/src/lobbying/types"
import { NonBillActivity } from "components/lobbying/NonBillActivity"
import { isNoClient, normalizePosition } from "components/lobbying/activity"
import { LobbyingPositionChip } from "components/lobbying/LobbyingPositionChip"
import {
  formatCount,
  formatCurrency,
  MAPLE_COLORS
} from "components/lobbying/chartTheme"
import { LobbyingAttribution } from "components/lobbying/LobbyingAttribution"
import { courtShortLabel } from "components/lobbying/sessions"
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"
import { usePagination } from "components/lobbying/usePagination"
import { LobbyingPaginationBar } from "components/lobbying/LobbyingPaginationBar"
import { SosSourceLink } from "components/lobbying/SosSourceLink"
import { regTypeLabel } from "components/lobbying/regTypeLabel"
import {
  LobbyingLoadError,
  LobbyingPanel,
  listTableStyle,
  listTdStyle,
  subTextStyle,
  toggleButtonStyle,
  ToggleChevron
} from "components/lobbying/LobbyingPanel"
import { thStyle } from "components/lobbying/SortTh"
import {
  compareFilingPeriodsDesc,
  filingPeriodLabel
} from "components/lobbying/filingPeriod"

const PAGE_SIZE = 25

function FirmDetail() {
  const { t, i18n } = useTranslation("lobbying")
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
          b.year - a.year ||
          // Bills first, then items with no bill (e.g. Executive).
          Number(!a.billId) - Number(!b.billId) ||
          (a.billId ?? "").localeCompare(b.billId ?? "") ||
          a.clientName.localeCompare(b.clientName) ||
          compareFilingPeriodsDesc(a, b)
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
  const sourcedRegistrations = registrations.filter(r => r.sourceUrl)
  const employers = partiesByName(registrations, "employers")
  const registeredLobbyists = partiesByName(registrations, "lobbyists")
  const filesThroughEmployer =
    summary?.hasFilings === false && (filings?.length ?? 0) === 0
  // One entry per client, with the compensation reported in each period
  // (most recent first), since a client may appear on several periods'
  // registrant docs.
  const clientMap = new Map<string, Omit<FirmClient, "total">>()
  for (const r of registrants ?? []) {
    for (const c of r.clients) {
      const entry = clientMap.get(c.clientNameNorm) ?? {
        clientName: c.clientName,
        clientNameNorm: c.clientNameNorm,
        periods: []
      }
      if (c.compensation != null) {
        entry.periods.push({
          periodStart: r.periodStart,
          periodEnd: r.periodEnd,
          year: r.year,
          compensation: c.compensation
        })
      }
      clientMap.set(c.clientNameNorm, entry)
    }
  }
  const allClients: FirmClient[] = [...clientMap.values()]
    .map(c => ({
      ...c,
      total: c.periods.reduce((sum, p) => sum + p.compensation, 0),
      periods: c.periods.sort(
        (a, b) =>
          b.year - a.year ||
          (b.periodStart ?? "").localeCompare(a.periodStart ?? "")
      )
    }))
    .sort((a, b) => a.clientNameNorm.localeCompare(b.clientNameNorm))

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
                  &nbsp;·&nbsp; {formatCurrency(totalCompensation)}{" "}
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
        {filStatus === "error" && <LobbyingLoadError error={filError} />}

        {!loading && (
          <Row className="mt-2">
            {/* Left: filings */}
            <Col md={8}>
              <LobbyingPanel
                title={t("titles.bills")}
                aside={
                  !filesThroughEmployer && (
                    <strong>
                      {t("firm.activities", {
                        count: totalItems,
                        n: formatCount(totalItems)
                      })}
                    </strong>
                  )
                }
              >
                {filesThroughEmployer ? (
                  <p style={noteStyle}>
                    {t("misc.filesThroughFirm", { name })}
                  </p>
                ) : (
                  <div>
                    <FirmBillsTable filings={pageItems} />
                    <LobbyingPaginationBar
                      page={page}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      pageSize={PAGE_SIZE}
                      onPage={setPage}
                    />
                  </div>
                )}
              </LobbyingPanel>
            </Col>

            {/* Right: clients + disclosure links */}
            <Col md={4}>
              {/* A lobbyist whose employer files has no clients of their own;
                  the note on the left explains where to look instead. */}
              {(allClients.length > 0 || !filesThroughEmployer) && (
                <LobbyingPanel
                  title={t("sections.clients")}
                  aside={
                    allClients.length > 0 && formatCount(allClients.length)
                  }
                >
                  {allClients.length === 0 ? (
                    <p style={noteStyle}>—</p>
                  ) : (
                    <ClientList clients={allClients} />
                  )}
                </LobbyingPanel>
              )}

              {employers.length > 0 && (
                <LobbyingPanel title={t("sections.employers")}>
                  <PartyList parties={employers} />
                </LobbyingPanel>
              )}

              {(registeredLobbyists.length > 0 || lobbyists.length > 0) && (
                <LobbyingPanel title={t("sections.firmLobbyists")}>
                  {registeredLobbyists.length > 0 ? (
                    <PartyList parties={registeredLobbyists} />
                  ) : (
                    <ul style={listStyle}>
                      {lobbyists.map(lobbyist => (
                        <li key={lobbyist} style={listItemStyle}>
                          {lobbyist}
                        </li>
                      ))}
                    </ul>
                  )}
                </LobbyingPanel>
              )}

              {sourcedRegistrations.length > 0 && (
                <LobbyingPanel
                  title={t("sections.registrations")}
                  aside={formatCount(sourcedRegistrations.length)}
                >
                  <ShowMoreList
                    items={sourcedRegistrations}
                    render={r => (
                      <SosSourceLink
                        href={r.sourceUrl}
                        label={t("misc.registrationYear", { year: r.year })}
                      />
                    )}
                  />
                </LobbyingPanel>
              )}

              {allDisclosures.length > 0 && (
                <LobbyingPanel
                  title={t("misc.disclosures")}
                  aside={formatCount(allDisclosures.length)}
                >
                  <ShowMoreList
                    items={allDisclosures}
                    render={(d, i) => (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        style={linkStyle}
                      >
                        {formatDisclosureLabel(d, t, i, i18n.language)}
                      </a>
                    )}
                  />
                </LobbyingPanel>
              )}

              {(filings?.length ?? 0) > 0 && (
                <LobbyingPanel title={t("filters.position")}>
                  <div
                    style={{
                      ...bodyStyle,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem"
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
                            <span>{positionCounts[pos]}</span>
                          </div>
                        )
                    )}
                  </div>
                </LobbyingPanel>
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
    <ul style={listStyle}>
      {parties.map(p => (
        <li key={p.nameNorm || p.name} style={listItemStyle}>
          {p.hasProfile && p.nameNorm ? (
            <a
              href={`/lobbying/firms/${encodeURIComponent(p.nameNorm)}`}
              style={linkStyle}
            >
              {p.name}
            </a>
          ) : (
            p.name
          )}{" "}
          <span style={subTextStyle}>
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

/** The filings, styled like the Lobbyists list: a bill (or a non-bill item
 * such as an Executive one), its client, position and period. */
function FirmBillsTable({ filings }: { filings: LobbyingFiling[] }) {
  const { t, i18n } = useTranslation("lobbying")
  const showSource = filings.some(f => f.disclosureUrl)
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={listTableStyle(640)}>
        {/* The client, whose names run longest, takes what the fixed
            columns leave. */}
        <colgroup>
          <col style={{ width: 280 }} />
          <col />
          <col style={{ width: 104 }} />
          <col style={{ width: 112 }} />
          {/* Room for "Source", its header the widest thing in it. */}
          {showSource && <col style={{ width: 88 }} />}
        </colgroup>
        <thead>
          <tr>
            <th style={thStyle}>{t("fields.bill")}</th>
            <th style={thStyle}>{t("fields.clientName")}</th>
            <th style={thStyle}>{t("filters.position")}</th>
            <th style={thStyle}>{t("fields.period")}</th>
            {showSource && <th style={thStyle}>{t("fields.source")}</th>}
          </tr>
        </thead>
        <tbody>
          {filings.map(f => (
            <tr key={f.filingId}>
              <td style={listTdStyle}>
                {f.billId ? (
                  // As the Lobbied Bills list's Bill column, with the session
                  // under it, as that list shows across all sessions: these
                  // filings span them, and a bill number such as H2 recurs.
                  <>
                    <a
                      href={`/lobbying/bills/${f.generalCourt}/${f.billId}`}
                      style={{ ...linkStyle, fontWeight: 700, fontSize: 16 }}
                    >
                      {f.billId}
                    </a>
                    <div style={subTextStyle}>
                      {courtShortLabel(f.generalCourt)}
                    </div>
                  </>
                ) : (
                  <NonBillActivity filing={f} showTitle />
                )}
              </td>
              <td style={listTdStyle}>
                <a
                  href={`/lobbying/clients/${encodeURIComponent(
                    f.clientNameNorm
                  )}`}
                  style={linkStyle}
                >
                  {f.clientName}
                </a>
              </td>
              <td style={listTdStyle}>
                <LobbyingPositionChip
                  position={normalizePosition(f.position)}
                />
              </td>
              <td style={{ ...listTdStyle, whiteSpace: "nowrap" }}>
                {filingPeriodLabel(f, i18n.language)}
              </td>
              {showSource && (
                <td style={listTdStyle}>
                  <SosSourceLink href={f.disclosureUrl} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type FirmClient = {
  clientName: string
  clientNameNorm: string
  // The sum of its periods' compensation.
  total: number
  periods: {
    periodStart?: string | null
    periodEnd?: string | null
    year: number
    compensation: number
  }[]
}

/** Each client with its total; expanding one lists what it paid by period. */
function ClientList({ clients }: { clients: FirmClient[] }) {
  const { t, i18n } = useTranslation("lobbying")
  const idPrefix = useId()
  const [open, setOpen] = useState<Set<string>>(new Set())
  const toggle = (key: string) =>
    setOpen(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <ul style={clientListStyle}>
      {clients.map((c, i) => {
        const isOpen = open.has(c.clientNameNorm)
        const periodsId = `${idPrefix}-${i}`
        return (
          <li key={c.clientNameNorm} style={listItemStyle}>
            <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
              {c.periods.length > 0 ? (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={periodsId}
                  aria-label={t(
                    isOpen ? "firm.hidePayments" : "firm.showPayments",
                    { name: c.clientName }
                  )}
                  onClick={() => toggle(c.clientNameNorm)}
                  style={toggleButtonStyle}
                >
                  <ToggleChevron open={isOpen} />
                </button>
              ) : (
                <span style={{ ...toggleButtonStyle, cursor: "default" }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <a
                  href={`/lobbying/clients/${encodeURIComponent(
                    c.clientNameNorm
                  )}`}
                  style={linkStyle}
                >
                  {c.clientName}
                </a>
                {isNoClient(c.clientNameNorm) && (
                  <div style={subTextStyle}>
                    {t("activity.notOrganization")}
                  </div>
                )}
              </div>
              {c.periods.length > 0 && (
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  {formatCurrency(c.total)}
                </span>
              )}
            </div>
            {isOpen && (
              <div id={periodsId} style={{ paddingLeft: 30 }}>
                {c.periods.map((p, j) => (
                  <div key={j} style={periodRowStyle}>
                    <span>{formatDisclosureLabel(p, t, j, i18n.language)}</span>
                    <span>{formatCurrency(p.compensation)}</span>
                  </div>
                ))}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** The first few items, then a button that shows the rest. */
function ShowMoreList<T>({
  items,
  render,
  initial = 3
}: {
  items: T[]
  render: (item: T, index: number) => React.ReactNode
  initial?: number
}) {
  const { t } = useTranslation("lobbying")
  const restId = useId()
  const [all, setAll] = useState(false)
  const rest = items.length - initial
  const shown = all ? items : items.slice(0, initial)
  return (
    <>
      <ul id={restId} style={listStyle}>
        {shown.map((item, i) => (
          <li key={i} style={listItemStyle}>
            {render(item, i)}
          </li>
        ))}
      </ul>
      {rest > 0 && (
        <button
          type="button"
          aria-expanded={all}
          aria-controls={restId}
          onClick={() => setAll(v => !v)}
          style={showMoreStyle}
        >
          <ToggleChevron open={all} />{" "}
          {all
            ? t("misc.showFewer")
            : t("misc.showAll", { count: items.length })}
        </button>
      )}
    </>
  )
}

// Older registrant docs (not yet reprocessed with a parsed reporting period)
// fall back to just the year, then to a plain numbered label as a last resort.
function formatDisclosureLabel(
  d: { periodStart?: string | null; periodEnd?: string | null; year: number },
  t: (key: string, opts?: Record<string, unknown>) => string,
  index: number,
  locale: string
): string {
  // The reporting period, as the filings table labels it; a disclosure with
  // no period or year gets its number.
  return d.year
    ? filingPeriodLabel(d, locale)
    : t("misc.disclosureLink", { number: index + 1 })
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

const bodyStyle: React.CSSProperties = {
  fontSize: 14,
  color: MAPLE_COLORS.textBody
}

const linkStyle: React.CSSProperties = { color: MAPLE_COLORS.primary }

const listStyle: React.CSSProperties = {
  ...bodyStyle,
  paddingLeft: "1.25rem",
  margin: 0
}

const listItemStyle: React.CSSProperties = { marginBottom: "0.4rem" }

const clientListStyle: React.CSSProperties = {
  ...bodyStyle,
  margin: 0,
  padding: 0,
  listStyle: "none"
}

const noteStyle: React.CSSProperties = { ...bodyStyle, margin: 0 }

const periodRowStyle: React.CSSProperties = {
  ...subTextStyle,
  display: "flex",
  justifyContent: "space-between",
  gap: "0.75rem"
}

const showMoreStyle: React.CSSProperties = {
  ...toggleButtonStyle,
  width: "auto",
  height: "auto",
  alignSelf: "flex-start",
  marginTop: "0.25rem",
  fontWeight: 600
}
