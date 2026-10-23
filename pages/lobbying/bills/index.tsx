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
  FilterLabel,
  LobbyingFilterBar,
  LobbyingLoadError,
  LobbyingPanel,
  listTableStyle,
  listTdStyle,
  searchStyle,
  sessionSelectStyle,
  subTextStyle
} from "components/lobbying/LobbyingPanel"
import { usePagination } from "components/lobbying/usePagination"
import { LobbyingPaginationBar } from "components/lobbying/LobbyingPaginationBar"
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"
import { PositionBar, PositionLegend } from "components/lobbying/PositionBar"
import {
  SessionSelect,
  type SessionFilter
} from "components/lobbying/SessionSelect"
import { matchesSearch } from "components/lobbying/searchMatch"
import { courtName, courtShortLabel } from "components/lobbying/sessions"
import { SortTh, thStyle, type SortDir } from "components/lobbying/SortTh"

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

  const sessionLabel =
    session === "all" ? t("filters.allSessionsSince") : courtName(session)

  return (
    <>
      <LobbyingFilterBar boxed>
        <FilterLabel htmlFor="bills-session">
          {t("filters.session")}
        </FilterLabel>
        <SessionSelect
          id="bills-session"
          sessions={ALL_COURTS}
          value={session}
          onChange={setSession}
          current={initialCourt}
          allLabel={t("filters.allSessionsSince")}
          style={sessionSelectStyle}
        />
        <input
          type="search"
          placeholder={`${t("activity.billSearch")}…`}
          aria-label={t("activity.billSearch")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={searchStyle}
        />
      </LobbyingFilterBar>

      <LobbyingPanel
        title={t("billList.panelTitle", { session: sessionLabel })}
        aside={
          !loadingOther && (
            <>
              <strong>
                {t("billList.count", {
                  count: totalItems,
                  n: formatCount(totalItems)
                })}
              </strong>{" "}
              · {t("billList.sortHint")}
            </>
          )
        }
        footer={<PositionLegend note={t("billList.positionsNote")} />}
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
                  <col style={{ width: 170 }} />
                  <col style={{ width: 260 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={thStyle}>{t("fields.bill")}</th>
                    <th style={thStyle}>{t("billList.title")}</th>
                    <SortTh
                      label={t("activity.organizations")}
                      sortKey="orgs"
                      current="orgs"
                      dir={sortDir}
                      onSort={() =>
                        setSortDir(d => (d === "asc" ? "desc" : "asc"))
                      }
                    />
                    <th style={thStyle}>
                      {t("overview.positionsReported")}{" "}
                      <span style={{ textTransform: "none", fontWeight: 400 }}>
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
                            fontWeight: 700
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
                          counts={{
                            support: b.orgSupport,
                            oppose: b.orgOppose,
                            neutral: b.orgNeutral
                          }}
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
        <Row className="mt-4 mb-3">
          <Col>
            <h1>{t("titles.bills")}</h1>
            <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 14 }}>
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
