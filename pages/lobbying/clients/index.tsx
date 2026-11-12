import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import {
  fetchClientList,
  fetchLobbyingStats,
  latestCourt,
  sessionsNewestFirst,
  useLobbyingClientRows,
  type ClientListRow
} from "components/db/lobbying"
import { createLobbyingListProps } from "components/lobbying/listPageProps"
import {
  formatCount,
  formatCurrency,
  MAPLE_COLORS
} from "components/lobbying/chartTheme"
import { lobbyistMix, lobbyistMixText } from "components/lobbying/clientCounts"
import { LobbyingAttribution } from "components/lobbying/LobbyingAttribution"
import {
  FloatingSearch,
  listTableStyle,
  listTdStyle,
  LobbyingFilterBar,
  LobbyingLoadError,
  LobbyingPanel,
  pageIntroStyle,
  sessionSelectStyle,
  subTextStyle
} from "components/lobbying/LobbyingPanel"
import { usePagination } from "components/lobbying/usePagination"
import { LobbyingPaginationBar } from "components/lobbying/LobbyingPaginationBar"
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"
import { usePrerenderedRows } from "components/lobbying/usePrerenderedRows"
import { matchesSearch } from "components/lobbying/searchMatch"
import { SessionFilter, SessionSelect } from "components/lobbying/SessionSelect"
import { SortTh, type SortDir } from "components/lobbying/SortTh"

const PAGE_SIZE = 50

type ClientSortKey = "name" | "bills" | "lobbyists" | "paid"

type ClientsPageProps = {
  // Every session any client was active in, newest first. The latest
  // session's rows are prerendered; other sessions load on demand.
  sessions: number[]
  initialCourt: number
  initialRows: ClientListRow[]
}

function LobbyingClientsTable({
  sessions,
  initialCourt,
  initialRows
}: ClientsPageProps) {
  const { t } = useTranslation("lobbying")

  const [search, setSearch] = useState("")
  const [session, setSession] = useState<SessionFilter>(initialCourt)
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

  const { rows, loading, error } = usePrerenderedRows(
    session,
    initialCourt,
    initialRows,
    useLobbyingClientRows
  )

  const clientRows = useMemo(
    () => (rows ?? []).map(c => ({ ...c, lobbyists: lobbyistMix(c, session) })),
    [rows, session]
  )

  const sorted = useMemo(() => {
    const mul = sortDir === "asc" ? 1 : -1
    // Missing figures sort last either way.
    const byNumber = (x: number | null, y: number | null) =>
      x == null ? (y == null ? 0 : 1) : y == null ? -1 : mul * (x - y)
    return clientRows
      .filter(c => !search || matchesSearch(c.clientName, search))
      .sort((a, b) => {
        switch (sortKey) {
          case "bills":
            return byNumber(a.bills, b.bills)
          case "lobbyists":
            return byNumber(
              a.lobbyists?.total ?? null,
              b.lobbyists?.total ?? null
            )
          case "paid":
            return byNumber(a.compensation, b.compensation)
          default:
            return mul * a.clientNameNorm.localeCompare(b.clientNameNorm)
        }
      })
  }, [clientRows, search, sortKey, sortDir])

  const { page, setPage, pageItems, totalPages, totalItems } = usePagination(
    sorted,
    PAGE_SIZE
  )
  // "No client" is listed but isn't a client organization.
  const clientCount = useMemo(
    () => totalItems - (sorted.some(c => c.placeholder) ? 1 : 0),
    [sorted, totalItems]
  )

  useEffect(() => {
    setPage(1)
  }, [search, session, sortKey, sortDir, setPage])

  return (
    <>
      <LobbyingFilterBar boxed="open">
        <SessionSelect
          id="clients-session"
          sessions={sessions}
          value={session}
          onChange={setSession}
          current={initialCourt}
          allLabel={t("filters.allSessionsSince")}
          style={sessionSelectStyle}
        />
        <FloatingSearch
          id="clients-search"
          label={t("activity.clientSearch")}
          value={search}
          onChange={setSearch}
          grow
        />
      </LobbyingFilterBar>

      <LobbyingPanel
        title={t("clients.panelTitle")}
        // How to sort, beside the title, on the Clients list only.
        titleNote={t("billList.sortHint")}
        session={session}
        sessions={sessions}
        aside={
          !loading && (
            // The count in bold Lexend, then what it counts in light Lexend, at
            // one size.
            <strong style={countStyle}>
              <span style={countNumberStyle}>{formatCount(clientCount)}</span>
              {t("clients.count", { count: clientCount })}
            </strong>
          )
        }
        footer={t("clients.paidNote")}
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
                <colgroup>
                  <col />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 260 }} />
                  <col style={{ width: 170 }} />
                </colgroup>
                <thead>
                  <tr>
                    <SortTh
                      label={t("fields.clientName")}
                      byName
                      sortKey="name"
                      current={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortTh
                      label={t("clients.bills")}
                      sortKey="bills"
                      current={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortTh
                      label={t("clients.lobbyists")}
                      sortKey="lobbyists"
                      current={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortTh
                      label={t("activity.reportedPaid")}
                      sortKey="paid"
                      current={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(c => (
                    <tr key={c.clientNameNorm}>
                      <td style={rowTdStyle}>
                        <a
                          href={`/lobbying/clients/${encodeURIComponent(
                            c.clientNameNorm
                          )}`}
                          style={{
                            color: MAPLE_COLORS.primary,
                            fontWeight: 700,
                            fontSize: 15
                          }}
                        >
                          {c.clientName}
                        </a>
                        {c.placeholder && (
                          <div style={subTextStyle}>
                            {t("activity.notOrganization")}
                          </div>
                        )}
                      </td>
                      <td style={rowTdStyle}>
                        <div style={figureStyle}>{c.bills ?? "—"}</div>
                      </td>
                      <td style={rowTdStyle}>
                        {/* As the Bills and Reported paid figures. */}
                        <div style={figureStyle}>
                          {c.lobbyists?.total ?? "—"}
                        </div>
                        {/* In-house and firms don't apply to "No client". */}
                        {c.lobbyists && !c.placeholder && (
                          <div style={subTextStyle}>
                            {lobbyistMixText(c.lobbyists, t)}
                          </div>
                        )}
                      </td>
                      <td style={rowTdStyle}>
                        <div style={figureStyle}>
                          {c.compensation != null
                            ? formatCurrency(c.compensation)
                            : "—"}
                        </div>
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
              itemLabel={t("clients.items")}
            />
          </div>
        )}
      </LobbyingPanel>
    </>
  )
}

function LobbyingClientsPage(props: ClientsPageProps) {
  const { t } = useTranslation("lobbying")
  return (
    <>
      <LobbyingSubnav />
      <Container>
        {/* The title closer to the filters, the page under it where it was:
            half the description's 1rem margin moved above the title. */}
        <Row className="mb-3" style={{ marginTop: "1.875rem" }}>
          <Col>
            <h1>{t("titles.clients")}</h1>
            <p style={{ ...pageIntroStyle, marginBottom: "0.5rem" }}>
              {t("explainers.clients")}
            </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <LobbyingClientsTable {...props} />
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

export const getStaticProps = createLobbyingListProps(async () => {
  const stats = await fetchLobbyingStats()
  const initialCourt = latestCourt(stats)
  return {
    sessions: sessionsNewestFirst(stats),
    initialCourt,
    initialRows: await fetchClientList(initialCourt)
  }
})

// Every cell of a row at its top.
const rowTdStyle: React.CSSProperties = {
  ...listTdStyle,
  verticalAlign: "top"
}

const figureStyle: React.CSSProperties = {
  // A step under bold, so the table isn't all bold beside its bold names.
  fontWeight: 600,
  fontSize: 16,
  color: MAPLE_COLORS.textStrong
}

const countStyle: React.CSSProperties = {
  // Lexend at its lightest loaded weight (styles/bootstrap.scss).
  fontFamily: "var(--maple-font-heading)",
  fontSize: 16,
  fontWeight: 300,
  // The label and the count centred on each other.
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3em"
}

const countNumberStyle: React.CSSProperties = {
  fontFamily: "var(--maple-font-heading)",
  fontSize: 16,
  fontWeight: 700
}
