import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import {
  fetchFirmList,
  fetchLobbyingStats,
  latestCourt,
  sessionsNewestFirst,
  useLobbyingFirmRows,
  type FirmSessionRow
} from "components/db/lobbying"
import { createLobbyingListProps } from "components/lobbying/listPageProps"
import { formatCount, MAPLE_COLORS } from "components/lobbying/chartTheme"
import { LobbyingAttribution } from "components/lobbying/LobbyingAttribution"
import {
  FilterLabel,
  LobbyingFilterBar,
  LobbyingLoadError,
  LobbyingPanel,
  listTableStyle,
  listTdStyle,
  searchStyle,
  selectStyle,
  sessionSelectStyle,
  subTextStyle
} from "components/lobbying/LobbyingPanel"
import { usePagination } from "components/lobbying/usePagination"
import { LobbyingPaginationBar } from "components/lobbying/LobbyingPaginationBar"
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"
import { usePrerenderedRows } from "components/lobbying/usePrerenderedRows"
import { matchesSearch } from "components/lobbying/searchMatch"
import { regTypeLabel } from "components/lobbying/regTypeLabel"
import { SessionFilter, SessionSelect } from "components/lobbying/SessionSelect"
import { SortTh, thStyle, type SortDir } from "components/lobbying/SortTh"

const PAGE_SIZE = 50

type FirmSortKey = "name" | "clients" | "sessions" | "filings"

type FirmRow = FirmSessionRow & {
  // Lobbyists whose name matched the search when the firm's own name didn't.
  matchedLobbyists?: string[]
}

type FirmsPageProps = {
  // Every session with data, newest first.
  sessions: number[]
  // The session in progress, as on the other lobbying pages: the newest one
  // with any data. The list opens on it, prerendered; other sessions load on
  // demand.
  currentCourt: number
  initialRows: FirmSessionRow[]
}

function LobbyingFirmsTable({
  sessions,
  currentCourt,
  initialRows
}: FirmsPageProps) {
  const { t } = useTranslation("lobbying")
  const [regTypeFilter, setRegTypeFilter] = useState<
    "all" | "Lobbyist" | "Employer"
  >("all")
  const [search, setSearch] = useState("")
  const [session, setSession] = useState<SessionFilter>(currentCourt)
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

  const { rows, loading, error } = usePrerenderedRows(
    session,
    currentCourt,
    initialRows,
    useLobbyingFirmRows
  )

  // A firm's disclosures are credited to the firm, so a lobbyist who only
  // appears on a firm's disclosures is found through the firm.
  const filtered = useMemo(() => {
    const matches: FirmRow[] = []
    for (const f of rows ?? []) {
      if (regTypeFilter !== "all" && f.regType !== regTypeFilter) continue
      if (!search || matchesSearch(f.entityName, search)) {
        matches.push(f)
        continue
      }
      const matchedLobbyists = f.lobbyists.filter(n => matchesSearch(n, search))
      if (matchedLobbyists.length > 0) matches.push({ ...f, matchedLobbyists })
    }
    return matches
  }, [rows, regTypeFilter, search])

  const sorted = useMemo(() => {
    const mul = sortDir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "clients":
          return mul * (a.clientCount - b.clientCount)
        case "sessions":
          return mul * (a.years.length - b.years.length)
        case "filings":
          return mul * ((a.filings ?? -1) - (b.filings ?? -1))
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
  }, [regTypeFilter, session, search, sortKey, sortDir, setPage])

  return (
    <>
      <LobbyingFilterBar boxed>
        <FilterLabel htmlFor="firms-session">
          {t("filters.session")}
        </FilterLabel>
        <SessionSelect
          id="firms-session"
          sessions={sessions}
          value={session}
          onChange={setSession}
          current={currentCourt}
          allLabel={t("filters.allSessionsSince")}
          style={sessionSelectStyle}
        />
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
          style={searchStyle}
          aria-label={t("filters.search")}
        />
      </LobbyingFilterBar>

      <LobbyingPanel
        title={t("sections.firms")}
        footer={t("firmList.dashNote")}
        aside={
          !loading && (
            <strong>
              {t("firmList.count", {
                count: totalItems,
                n: formatCount(totalItems)
              })}
            </strong>
          )
        }
      >
        {error ? (
          <LobbyingLoadError error={error} style={{ margin: 0 }} />
        ) : loading ? (
          <p style={{ color: MAPLE_COLORS.textMuted, margin: 0 }}>
            {t("loading")}
          </p>
        ) : (
          <div>
            <div style={{ overflowX: "auto" }}>
              <table style={listTableStyle(720)}>
                {/* Fixed widths, so a re-sort that brings in other rows
                  doesn't resize the columns. */}
                <colgroup>
                  <col />
                  <col style={{ width: 160 }} />
                  <col style={{ width: 120 }} />
                  <col style={{ width: 190 }} />
                  <col style={{ width: 100 }} />
                </colgroup>
                <thead>
                  <tr>
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
                    <tr key={f.entityNameNorm}>
                      <td style={listTdStyle}>
                        <a
                          href={`/lobbying/firms/${encodeURIComponent(
                            f.entityNameNorm
                          )}`}
                          style={{
                            color: MAPLE_COLORS.primary,
                            fontWeight: 700
                          }}
                        >
                          {f.entityName}
                        </a>
                        {!!f.matchedLobbyists?.length && (
                          <div style={subTextStyle}>
                            {t("misc.matchedLobbyists", {
                              names: f.matchedLobbyists?.join(", ")
                            })}
                          </div>
                        )}
                        {f.employers.length > 0 && (
                          <div style={subTextStyle}>
                            {t("misc.atFirms", {
                              firms: f.employers.join(", ")
                            })}
                          </div>
                        )}
                      </td>
                      <td style={listTdStyle}>
                        <span style={typePillStyle(f.regType)}>
                          {regTypeLabel(f.regType, t)}
                        </span>
                      </td>
                      <td style={{ ...listTdStyle, whiteSpace: "nowrap" }}>
                        {f.years.length === 1
                          ? f.years[0]
                          : `${f.years[f.years.length - 1]}–${f.years[0]}`}
                      </td>
                      <td style={figureTdStyle}>
                        {f.hasFilings ? (
                          f.clientCount
                        ) : (
                          <span title={t("firmList.dashTitle")}>—</span>
                        )}
                      </td>
                      <td style={figureTdStyle}>
                        {f.filings ?? (
                          <span title={t("firmList.dashTitle")}>—</span>
                        )}
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
          </div>
        )}
      </LobbyingPanel>
    </>
  )
}

function LobbyingFirmsPage(props: FirmsPageProps) {
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
            <LobbyingFirmsTable {...props} />
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

export const getStaticProps = createLobbyingListProps<FirmsPageProps>(
  async () => {
    const stats = await fetchLobbyingStats()
    const currentCourt = latestCourt(stats)
    return {
      sessions: sessionsNewestFirst(stats),
      currentCourt,
      initialRows: await fetchFirmList(currentCourt)
    }
  }
)

// The registration type as a pill; entities a shade darker than individuals.
const typePillStyle = (regType: string): React.CSSProperties => ({
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: 999,
  background:
    regType === "Employer"
      ? MAPLE_COLORS.blueBorder
      : MAPLE_COLORS.blueSubtleBg,
  color: MAPLE_COLORS.textStrong,
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: "nowrap"
})

// Counts stand out, as on the other lists.
const figureTdStyle: React.CSSProperties = {
  ...listTdStyle,
  fontWeight: 700,
  color: MAPLE_COLORS.textStrong
}
