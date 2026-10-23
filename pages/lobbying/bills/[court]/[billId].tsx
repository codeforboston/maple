import React, { useMemo, useState } from "react"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { Col, Container, Row } from "components/bootstrap"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import {
  useLobbyingFilingsForBill,
  useLobbyingInHouseFilers,
  useLobbyingRegistrantsByIds
} from "components/db/lobbying"
import {
  filterActivity,
  groupActivity,
  orgPositionBreakdown,
  type PositionFilter
} from "components/lobbying/activity"
import { ActivityTable } from "components/lobbying/ActivityTable"
import {
  LobbyingAttribution,
  SOS_URL
} from "components/lobbying/LobbyingAttribution"
import {
  bigFigureRowStyle,
  bigFigureStyle,
  FilterLabel,
  LobbyingFilterBar,
  LobbyingLoadError,
  LobbyingPanel,
  searchStyle,
  summaryNoteStyle,
  summaryStyle
} from "components/lobbying/LobbyingPanel"
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"
import {
  MAPLE_COLORS,
  POSITION_TEXT_COLORS
} from "components/lobbying/chartTheme"
import { PositionBar } from "components/lobbying/PositionBar"
import { PositionSelect } from "components/lobbying/PositionSelect"
import { courtName } from "components/lobbying/sessions"

function BillLobbyingPage() {
  const { t } = useTranslation("lobbying")
  const { query } = useRouter()
  const court = Number(query.court)
  const billId = query.billId as string | undefined

  const {
    result: filings,
    status,
    error
  } = useLobbyingFilingsForBill(court, billId ?? "")
  const registrantIds = useMemo(
    () => (filings ?? []).map(f => f.registrantId),
    [filings]
  )
  const registrants = useLobbyingRegistrantsByIds(registrantIds)
  const inHouseFilers = useLobbyingInHouseFilers(court)

  // A hook keeps its last result while it reloads, so wait for both to
  // settle on these filings.
  const activity = useMemo(
    () =>
      filings &&
      registrants.status === "success" &&
      inHouseFilers.status === "success"
        ? groupActivity(
            filings,
            "client",
            registrants.result ?? {},
            inHouseFilers.result ?? {}
          )
        : undefined,
    [
      filings,
      registrants.status,
      registrants.result,
      inHouseFilers.status,
      inHouseFilers.result
    ]
  )
  const filerCount = useMemo(
    () => new Set((filings ?? []).map(f => f.entityNameNorm)).size,
    [filings]
  )
  const breakdown = useMemo(
    () => (activity ? orgPositionBreakdown(activity.rows) : undefined),
    [activity]
  )

  const [position, setPosition] = useState<PositionFilter>("all")
  const [search, setSearch] = useState("")
  const shown = useMemo(
    () => activity && filterActivity(activity, position, search),
    [activity, position, search]
  )

  const title = filings?.find(f => f.activityTitle)?.activityTitle
  const mapleHref =
    court >= 192 && billId ? `/bills/${court}/${billId}` : undefined
  const failed =
    status === "error" ||
    registrants.status === "error" ||
    inHouseFilers.status === "error"
  const failure = error ?? registrants.error ?? inHouseFilers.error

  if (!billId) return null

  return (
    <>
      <LobbyingSubnav />
      <Container>
        <Row className="mt-4 mb-4">
          <Col>
            <a
              href="/lobbying/bills"
              style={{ color: MAPLE_COLORS.primary, fontWeight: 700 }}
            >
              {t("bill.back")}
            </a>
            <div style={eyebrowStyle}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{billId}</span>
              {court > 0 && <span>{courtName(court)}</span>}
            </div>
            <h1 style={{ maxWidth: 900 }}>{title ?? billId}</h1>
            <div style={linksStyle}>
              {mapleHref && <a href={mapleHref}>{t("misc.viewOnMaple")}</a>}
              <a href={SOS_URL} target="_blank" rel="noreferrer">
                {t("bill.searchSos")}
              </a>
            </div>
          </Col>
        </Row>

        {failed && <LobbyingLoadError error={failure} />}
        {!failed && !activity && (
          <p style={{ color: MAPLE_COLORS.textMuted }}>{t("loading")}</p>
        )}

        {/* shown and breakdown exist exactly when activity does. */}
        {activity && shown && breakdown && (
          <>
            <LobbyingPanel title={t("bill.summary")}>
              <div style={summaryStyle}>
                <div style={{ flex: "0 1 260px" }}>
                  <div style={bigFigureRowStyle}>
                    <span style={bigFigureStyle}>{activity.rows.length}</span>
                    <span style={{ fontWeight: 700 }}>
                      {t("bill.orgs", { count: activity.rows.length })}
                    </span>
                  </div>
                  <div style={summaryNoteStyle}>
                    {t("bill.orgsDetail", {
                      filings: t("activity.filings", {
                        count: filings?.length ?? 0
                      }),
                      filers: t("bill.filers", { count: filerCount })
                    })}
                  </div>
                </div>
                <div style={{ flex: "999 1 420px", minWidth: 0 }}>
                  <div style={captionStyle}>{t("bill.positionsByOrg")}</div>
                  <PositionBar height={16} counts={breakdown} />
                  <ul style={countsStyle}>
                    {(
                      Object.keys(
                        POSITION_TEXT_COLORS
                      ) as (keyof typeof POSITION_TEXT_COLORS)[]
                    )
                      .filter(p => breakdown[p] > 0)
                      .map(p => (
                        <li key={p}>
                          <span
                            style={{
                              fontSize: 22,
                              fontWeight: 700,
                              color: POSITION_TEXT_COLORS[p]
                            }}
                          >
                            {breakdown[p]}
                          </span>{" "}
                          <span style={{ fontWeight: 700 }}>
                            {t(`position.${p}`)}
                          </span>
                        </li>
                      ))}
                  </ul>
                  <div style={summaryNoteStyle}>{t("bill.orgCountNote")}</div>
                </div>
              </div>
            </LobbyingPanel>

            <LobbyingPanel
              title={t("bill.orgsPanel", { bill: billId })}
              aside={t("bill.orgsHint")}
            >
              <LobbyingFilterBar>
                <FilterLabel htmlFor="bill-position">
                  {t("filters.position")}
                </FilterLabel>
                <PositionSelect
                  id="bill-position"
                  value={position}
                  onChange={setPosition}
                  allLabel={t("filters.allPositions")}
                />
                <input
                  type="search"
                  placeholder={`${t("bill.filterOrgs")}…`}
                  aria-label={t("bill.filterOrgs")}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={searchStyle}
                />
              </LobbyingFilterBar>
              {shown.rows.length ? (
                <ActivityTable
                  by="client"
                  data={shown}
                  rowHref={row =>
                    `/lobbying/clients/${encodeURIComponent(row.key)}`
                  }
                  itemLabel={t("bill.items")}
                />
              ) : (
                <p style={{ color: MAPLE_COLORS.textMuted, margin: 0 }}>
                  {activity.rows.length ? t("bill.noMatch") : t("noData")}
                </p>
              )}
            </LobbyingPanel>
          </>
        )}
        <LobbyingAttribution className="mt-3" />
      </Container>
    </>
  )
}

export default createPage({
  titleI18nKey: "titles.lobbying",
  Page: BillLobbyingPage
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

// ── Styles ────────────────────────────────────────────────────────────────────

const eyebrowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  gap: "0.375rem 0.875rem",
  margin: "1.25rem 0 0.5rem",
  fontSize: 14,
  color: MAPLE_COLORS.graySubtleText
}

const linksStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.375rem 1.25rem",
  fontSize: 14,
  fontWeight: 700
}

const captionStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: MAPLE_COLORS.textMuted,
  marginBottom: "0.625rem"
}

const countsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem 2.25rem",
  listStyle: "none",
  margin: "0.625rem 0",
  padding: 0,
  fontSize: 14
}
