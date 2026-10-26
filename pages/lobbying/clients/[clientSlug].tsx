import React, { useMemo, useState } from "react"
import { omit, uniq } from "lodash"
import { useTranslation } from "next-i18next"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import {
  fetchClientSummary,
  fetchLatestLobbyingCourt,
  sumBills,
  useLobbyingFilingsForClient,
  useLobbyingRegistrantsByIds,
  type ClientSummaryRow
} from "components/db/lobbying"
import {
  filterActivity,
  groupActivity,
  type PositionFilter
} from "components/lobbying/activity"
import { ActivityTable } from "components/lobbying/ActivityTable"
import { formatCurrency, MAPLE_COLORS } from "components/lobbying/chartTheme"
import { lobbyistMix } from "components/lobbying/clientCounts"
import { LobbyingAttribution } from "components/lobbying/LobbyingAttribution"
import { createLobbyingListProps } from "components/lobbying/listPageProps"
import {
  bigFigureRowStyle,
  bigFigureStyle,
  FilterLabel,
  LobbyingFilterBar,
  LobbyingLoadError,
  LobbyingPanel,
  searchStyle,
  sessionSelectStyle,
  summaryNoteStyle,
  summaryStyle
} from "components/lobbying/LobbyingPanel"
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"
import { PositionSelect } from "components/lobbying/PositionSelect"
import {
  SessionSelect,
  type SessionFilter
} from "components/lobbying/SessionSelect"
import { courtName } from "components/lobbying/sessions"
import { SosSourceLink } from "components/lobbying/SosSourceLink"

// The client's summary, less its firms (which the page doesn't show).
type ClientDetailSummary = Omit<ClientSummaryRow, "firms">

type ClientDetailProps = {
  clientNameNorm: string
  // Null for a client with no summary.
  summary: ClientDetailSummary | null
  // The session in progress, as on the other lobbying pages: the newest one
  // with any data (not necessarily this client's).
  current: number
}

function ClientDetail({ clientNameNorm, summary, current }: ClientDetailProps) {
  const { t } = useTranslation("lobbying")

  // The client's sessions, newest first; it opens on the latest. A client
  // with no summary gets all its filings.
  const sessions = useMemo(
    () =>
      Object.keys(summary?.courts ?? {})
        .map(Number)
        .sort((a, b) => b - a),
    [summary]
  )
  const [chosen, setChosen] = useState<SessionFilter | null>(null)
  const session: SessionFilter = chosen ?? sessions[0] ?? "all"

  // Only the selected session's filings: a big client has thousands.
  const {
    result: filings,
    status: filStatus,
    error: filError
  } = useLobbyingFilingsForClient(clientNameNorm, session)
  const registrants = useLobbyingRegistrantsByIds(
    useMemo(() => (filings ?? []).map(f => f.registrantId), [filings])
  )
  // The client's in-house filers, from its summary: the inHouseFilers shape,
  // holding only this client (merged over its sessions for all sessions).
  const inHouseFilers = useMemo(() => {
    const courts = summary?.courts ?? {}
    const filers =
      session === "all"
        ? uniq(Object.values(courts).flatMap(e => e.inHouseFilers ?? []))
        : courts[String(session)]?.inHouseFilers ?? []
    return { [clientNameNorm]: filers }
  }, [summary, session, clientNameNorm])

  const activity = useMemo(
    () =>
      filings && registrants.result
        ? groupActivity(filings, "bill", registrants.result, inHouseFilers)
        : undefined,
    [filings, registrants.result, inHouseFilers]
  )

  const [position, setPosition] = useState<PositionFilter>("all")
  const [search, setSearch] = useState("")
  const shown = useMemo(
    () => activity && filterActivity(activity, position, search),
    [activity, position, search]
  )

  const failed = filStatus === "error" || registrants.status === "error"
  const failure = filError ?? registrants.error

  const displayName =
    summary?.clientName ?? filings?.[0]?.clientName ?? clientNameNorm
  const sessionLabel =
    session === "all" ? t("filters.allSessions") : courtName(session)

  return (
    <>
      <LobbyingSubnav />
      <Container>
        <Row className="mt-4 mb-4">
          <Col>
            <a
              href="/lobbying/clients"
              style={{ color: MAPLE_COLORS.primary, fontWeight: 700 }}
            >
              {t("client.back")}
            </a>
            <h1 className="mt-3" style={{ maxWidth: 900 }}>
              {displayName}
            </h1>
            <div style={subHeaderStyle}>
              <span style={{ color: MAPLE_COLORS.graySubtleText }}>
                {/* "No client" has no registration. */}
                {summary?.placeholder ? (
                  t("client.noClientKind")
                ) : (
                  <>
                    {t("client.kind")}
                    {summary && registeredText(summary, t)}
                  </>
                )}
              </span>
              <SosSourceLink
                href={summary?.registrationUrl}
                label={t("client.sosRegistration")}
                style={{ fontWeight: 700 }}
              />
            </div>
          </Col>
        </Row>

        {failed && <LobbyingLoadError error={failure} />}

        {summary && <ClientSummary summary={summary} session={session} />}

        <LobbyingPanel
          title={t("client.billsPanel", { session: sessionLabel })}
          aside={t("client.billsHint")}
        >
          <LobbyingFilterBar>
            <FilterLabel htmlFor="client-session">
              {t("filters.session")}
            </FilterLabel>
            <SessionSelect
              id="client-session"
              sessions={sessions}
              value={session}
              onChange={setChosen}
              current={current}
              style={sessionSelectStyle}
            />
            <FilterLabel htmlFor="client-position">
              {t("filters.position")}
            </FilterLabel>
            <PositionSelect
              id="client-position"
              value={position}
              onChange={setPosition}
              allLabel={t("filters.anyPosition")}
            />
            <input
              type="search"
              placeholder={`${t("activity.billSearch")}…`}
              aria-label={t("client.filterBills")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={searchStyle}
            />
          </LobbyingFilterBar>
          {!shown ? (
            !failed && (
              <p style={{ color: MAPLE_COLORS.textMuted, margin: 0 }}>
                {t("loading")}
              </p>
            )
          ) : shown.rows.length ? (
            <ActivityTable
              by="bill"
              data={shown}
              rowHref={row => `/lobbying/bills/${row.court}/${row.label}`}
              itemLabel={t("client.items")}
            />
          ) : (
            <p style={{ color: MAPLE_COLORS.textMuted, margin: 0 }}>
              {activity?.rows.length ? t("client.noMatch") : t("noData")}
            </p>
          )}
        </LobbyingPanel>
        <LobbyingAttribution className="mt-3" />
      </Container>
    </>
  )
}

function ClientSummary({
  summary,
  session
}: {
  summary: ClientDetailSummary
  session: SessionFilter
}) {
  const { t } = useTranslation("lobbying")
  const all = session === "all"
  const c = all ? undefined : summary.courts?.[String(session)]
  const bills = all ? sumBills(summary.courts) : c?.bills
  const paid = all ? summary.totalCompensation : c?.compensation
  const mix = lobbyistMix(all ? summary : c, session)
  const lobbyists = mix && t("client.lobbyists", { count: mix.total })
  const where = all
    ? t("client.whereAll")
    : t("overview.whereSession", { session: courtName(session) })

  return (
    <LobbyingPanel
      title={t("client.summary", {
        session: all ? t("filters.allSessions") : courtName(session)
      })}
    >
      <div style={summaryStyle}>
        <div style={{ flex: "0 1 240px" }}>
          <div style={bigFigureRowStyle}>
            <span style={bigFigureStyle}>{bills ?? "—"}</span>
            <span style={{ fontWeight: 700 }}>
              {t("client.bills", { count: bills ?? 0 })}
            </span>
          </div>
          {mix && mix.total > 0 && (
            <div style={summaryNoteStyle}>
              {/* In-house and firms don't apply to "No client". */}
              {summary.placeholder
                ? t("client.reportedByOnly", { lobbyists })
                : t("client.reportedBy", {
                    lobbyists,
                    inHouse:
                      mix.inHouse === mix.total
                        ? t("clients.allInHouse")
                        : mix.inHouse
                        ? t("clients.inHouse", { count: mix.inHouse })
                        : t("client.noneInHouse")
                  })}
            </div>
          )}
        </div>
        <div style={{ flex: "999 1 380px", minWidth: 0 }}>
          <div style={bigFigureRowStyle}>
            <span style={bigFigureStyle}>
              {paid != null ? formatCurrency(paid) : "—"}
            </span>
            <span style={{ fontWeight: 700 }}>{t("client.paidLabel")}</span>
          </div>
          <div style={summaryNoteStyle}>{t("client.paidNote", { where })}</div>
        </div>
      </div>
    </LobbyingPanel>
  )
}

// " · registered 2010 – 2026", or nothing when the dates are unknown.
function registeredText(
  summary: ClientDetailSummary,
  t: ReturnType<typeof useTranslation>["t"]
) {
  const from = summary.firstRegistered?.slice(0, 4)
  const to = summary.lastRegisteredYear
  if (!from) return null
  return ` · ${
    to && String(to) !== from
      ? t("client.registered", { from, to })
      : t("client.registeredSince", { from })
  }`
}

export default createPage({
  titleI18nKey: "titles.lobbying",
  Page: ClientDetail
})

export const getStaticProps = createLobbyingListProps<ClientDetailProps>(
  async ({ params }) => {
    const clientNameNorm = decodeURIComponent(String(params?.clientSlug ?? ""))
    const [summary, current] = await Promise.all([
      fetchClientSummary(clientNameNorm),
      fetchLatestLobbyingCourt()
    ])
    return {
      clientNameNorm,
      summary: summary ? omit(summary, "firms") : null,
      current
    }
  }
)

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}

const subHeaderStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  gap: "0.375rem 1.25rem",
  fontSize: 14
}
