import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import {
  fetchBillRows,
  fetchLatestLobbyingCourt,
  useLobbyingBillRows,
  type BillRow
} from "components/db/lobbying"
import { createLobbyingListProps } from "components/lobbying/listPageProps"
import { formatCount, MAPLE_COLORS } from "components/lobbying/chartTheme"
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
import {
  billPositionCounts,
  PositionBar,
  PositionLegend
} from "components/lobbying/PositionBar"
import {
  SessionSelect,
  type SessionFilter
} from "components/lobbying/SessionSelect"
import { matchesSearch } from "components/lobbying/searchMatch"
import { courtShortLabel } from "components/lobbying/sessions"
import {
  SortTh,
  thNoteStyle,
  thTopStyle,
  thWithNoteStyle,
  type SortDir
} from "components/lobbying/SortTh"

const ALL_COURTS = [194, 193, 192, 191, 190, 189, 188, 187, 186, 185, 184]
const PAGE_SIZE = 50

// ── Main table component ──────────────────────────────────────────────────────

type BillsPageProps = {
  // The latest session's rows are prerendered; other sessions load on demand.
  initialCourt: number
  initialRows: BillRow[]
}

function LobbyingBillsTable({ initialCourt, initialRows }: BillsPageProps) {
  const { t } = useTranslation("lobbying")
  const router = useRouter()
  const [session, setSession] = useState<SessionFilter>(initialCourt)
  const [search, setSearch] = useState("")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  // The Overview links here with ?session=<court> or ?session=all.
  useEffect(() => {
    if (router.query.session === "all") return setSession("all")
    const requested = Number(router.query.session)
    if (ALL_COURTS.includes(requested)) setSession(requested)
  }, [router.query.session])

  const otherCourts =
    session === "all"
      ? ALL_COURTS.filter(c => c !== initialCourt)
      : session === initialCourt
      ? []
      : [session]
  const { result: otherRows, status, error } = useLobbyingBillRows(otherCourts)
  const loadingOther =
    otherCourts.length > 0 &&
    (status === "loading" || status === "not-requested")
  const otherFailed = otherCourts.length > 0 && status === "error"
  const allRows = useMemo(
    () => [
      ...(session === "all" || session === initialCourt ? initialRows : []),
      ...(otherCourts.length > 0 ? otherRows ?? [] : [])
    ],
    // otherCourts is derived from session
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, initialCourt, initialRows, otherRows]
  )

  const sorted = useMemo(() => {
    const mul = sortDir === "asc" ? 1 : -1
    return allRows
      .filter(b => matchesSearch(`${b.billId} ${b.title}`, search))
      .sort((a, b) => mul * (a.clients - b.clients))
  }, [allRows, search, sortDir])

  const { page, setPage, pageItems, totalPages, totalItems } = usePagination(
    sorted,
    PAGE_SIZE
  )

  useEffect(() => {
    setPage(1)
  }, [session, search, sortDir, setPage])

  return (
    <>
      <LobbyingFilterBar boxed="open">
        <SessionSelect
          id="bills-session"
          sessions={ALL_COURTS}
          value={session}
          onChange={setSession}
          current={initialCourt}
          allLabel={t("filters.allSessionsSince")}
          style={sessionSelectStyle}
        />
        <FloatingSearch
          id="bills-search"
          label={t("activity.billSearch")}
          value={search}
          onChange={setSearch}
          grow
        />
      </LobbyingFilterBar>

      <LobbyingPanel
        title={t("billList.panelTitle")}
        // The overview's Most-Lobbied Bills hint, saying sorted for ranked:
        // the list can be sorted either way.
        hint={t("billList.hint")}
        session={session}
        sessions={ALL_COURTS}
        aside={
          !loadingOther && (
            // The count in bold Lexend, then what it counts in light Lexend, at
            // one size.
            <strong style={countStyle}>
              <span style={countNumberStyle}>{formatCount(totalItems)}</span>
              {t("billList.count", { count: totalItems })}
            </strong>
          )
        }
        footer={<PositionLegend multiple note={t("bill.orgCountNote")} />}
      >
        {loadingOther ? (
          <p style={{ color: MAPLE_COLORS.textMuted, margin: 0 }}>
            {t("loading")}
          </p>
        ) : otherFailed ? (
          <LobbyingLoadError error={error} style={{ margin: 0 }} />
        ) : sorted.length === 0 ? (
          <p style={{ color: MAPLE_COLORS.textMuted, margin: 0 }}>
            {t("noData")}
          </p>
        ) : (
          <div>
            <div style={{ overflowX: "auto" }}>
              <table style={listTableStyle(760)}>
                <colgroup>
                  <col style={{ width: 150 }} />
                  <col />
                  {/* Organizations: wider, the title giving way. */}
                  <col style={{ width: 240 }} />
                  {/* The bar's 160px and the cell's 12px each side, so the bar
                    ends as near the table's right edge as "Bill" starts from
                    its left. */}
                  <col style={{ width: 184 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={thTopStyle}>{t("fields.bill")}</th>
                    <th style={{ ...thTopStyle, paddingLeft: "1.5rem" }}>
                      {t("billList.title")}
                    </th>
                    <SortTh
                      label={t("activity.organizations")}
                      sortKey="orgs"
                      current="orgs"
                      dir={sortDir}
                      onSort={() =>
                        setSortDir(d => (d === "asc" ? "desc" : "asc"))
                      }
                    />
                    <th style={thWithNoteStyle}>
                      {t("overview.positionsReported")}{" "}
                      <span style={thNoteStyle}>
                        {t("overview.hoverForCounts")}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(b => (
                    <tr key={`${b.court}-${b.billId}`}>
                      <td style={listTdStyle}>
                        <a
                          href={`/lobbying/bills/${b.court}/${b.billId}`}
                          style={{
                            color: MAPLE_COLORS.primary,
                            fontWeight: 700,
                            fontSize: 16
                          }}
                        >
                          {b.billId}
                        </a>
                        {session === "all" && (
                          <div style={subTextStyle}>
                            {courtShortLabel(b.court)}
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          ...listTdStyle,
                          // More room before the title, after Bill, and after it, before
                          // Organizations.
                          paddingLeft: "1.5rem",
                          paddingRight: "2rem",
                          overflowWrap: "anywhere",
                          lineHeight: 1.4
                        }}
                      >
                        {b.title || "—"}
                      </td>
                      <td style={listTdStyle}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>
                          {b.clients || "—"}
                        </div>
                        <div style={subTextStyle}>
                          {t("activity.filings", { count: b.total })}
                        </div>
                      </td>
                      <td style={{ ...listTdStyle, paddingTop: "1.1rem" }}>
                        <PositionBar
                          width={160}
                          height={12}
                          counts={billPositionCounts(b)}
                        />
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
              itemLabel={t("billList.items")}
            />
          </div>
        )}
      </LobbyingPanel>

      <LobbyingAttribution />
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function LobbyingBillsPage(props: BillsPageProps) {
  const { t } = useTranslation("lobbying")
  return (
    <>
      <LobbyingSubnav />
      <Container>
        {/* The title closer to the filters, the page under it where it was:
            half the description's 1rem margin moved above the title. */}
        <Row className="mb-3" style={{ marginTop: "1.875rem" }}>
          <Col>
            <h1>{t("titles.bills")}</h1>
            <p style={{ ...pageIntroStyle, marginBottom: "0.5rem" }}>
              {t("explainers.bills")}
            </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <LobbyingBillsTable {...props} />
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default createPage({
  titleI18nKey: "titles.lobbying",
  Page: LobbyingBillsPage
})

export const getStaticProps = createLobbyingListProps(async () => {
  const initialCourt = await fetchLatestLobbyingCourt()
  return { initialCourt, initialRows: await fetchBillRows(initialCourt) }
})

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
