import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useMemo, useState } from "react"
import { omit } from "lodash"
import { useTranslation } from "next-i18next"
import { Col, Container, Row } from "components/bootstrap"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { createPage } from "components/page"
import {
  fetchLobbyingStats,
  fetchTopBillRows,
  latestCourt,
  sessionsNewestFirst,
  type BillRow
} from "components/db/lobbying"
import type { LobbyingStats } from "functions/src/lobbying/types"
import {
  BAR_PROPS,
  formatCount,
  formatCurrency,
  formatCurrencyCompact,
  GRID_PROPS,
  MAPLE_COLORS,
  MapleTooltip,
  usePrefersReducedMotion,
  X_AXIS_PROPS,
  Y_AXIS_PROPS
} from "components/lobbying/chartTheme"
import { LobbyingAttribution } from "components/lobbying/LobbyingAttribution"
import { createLobbyingListProps } from "components/lobbying/listPageProps"
import {
  listTableStyle,
  listTdStyle,
  LobbyingFilterBar,
  LobbyingPanel,
  pageIntroStyle,
  sessionSelectStyle,
  subTextStyle
} from "components/lobbying/LobbyingPanel"
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"
import lobbyingStyles from "components/lobbying/lobbying.module.css"
import { InfoTooltip } from "components/tooltip"
import {
  LegendSwatch,
  legendItemStyle,
  legendStyle,
  billPositionCounts,
  PositionBar,
  PositionLegend
} from "components/lobbying/PositionBar"
import {
  SessionSelect,
  type SessionFilter
} from "components/lobbying/SessionSelect"
import {
  courtName,
  courtShortLabel,
  courtStartYear,
  courtYears,
  sessionYears
} from "components/lobbying/sessions"
import {
  SortTh,
  thNoteStyle,
  thTopStyle,
  thWithNoteStyle,
  type SortDir
} from "components/lobbying/SortTh"

const TOP_BILLS = 5

// The stats doc, less what the page doesn't show.
type OverviewStats = Omit<LobbyingStats, "filingsByYear">
// The first year on the SoS portal.
const FIRST_YEAR = 2005

// ── Key figures ───────────────────────────────────────────────────────────────

type Figure = {
  label: string
  value: string
  sub?: string
  definition: string
}

function useFigures(
  stats: OverviewStats,
  session: SessionFilter,
  totalPaid: number
): Figure[] {
  const { t } = useTranslation("lobbying")
  // The session's years ("in 2025–26"), as the panel titles name it, not
  // its court; "in any session" for all of them.
  const where =
    session === "all" ? t("overview.whereAll") : sessionYears(session) ?? ""

  const all = session === "all"
  const c = all ? undefined : stats.courts?.[String(session)]
  const count = (n: number | undefined) =>
    n === undefined ? "—" : formatCount(n)
  const firms = all ? stats.totalEntities : c?.firms
  const paid = all ? totalPaid : c?.paid
  return [
    {
      label: t("overview.figBills"),
      value: count(all ? stats.totalBillsWithFilings : c?.bills),
      definition: t("overview.defBills", { where })
    },
    {
      label: t("overview.figClients"),
      value: count(all ? stats.totalClients : c?.clients),
      definition: t("overview.defClients", { where })
    },
    {
      label: t("overview.figLobbyists"),
      value: count(
        all ? stats.totalLobbyists ?? stats.totalRegistrants : c?.lobbyists
      ),
      sub:
        firms === undefined
          ? undefined
          : t("overview.subLobbyists", { firms: formatCount(firms) }),
      definition: t("overview.defLobbyists", { where })
    },
    {
      label: t("overview.figPaid"),
      value: paid === undefined ? "—" : formatCurrencyCompact(paid),
      definition: t("overview.defPaid", { where })
    }
  ]
}

function KeyFigures({
  stats,
  session,
  totalPaid
}: {
  stats: OverviewStats
  session: SessionFilter
  totalPaid: number
}) {
  const { t } = useTranslation("lobbying")
  const figures = useFigures(stats, session, totalPaid)

  return (
    <LobbyingPanel
      title={t("overview.keyFigures")}
      session={session}
      sessions={stats.courtsWithData}
      // The panels' own space under the title, as the chart beside it has.
      style={{ height: "100%", marginBottom: 0 }}
    >
      <div>
        {figures.map((f, i) => (
          <div
            key={f.label}
            // The last row without space under it: the panel's own padding
            // closes the card.
            style={
              i === figures.length - 1
                ? { ...figureRowStyle, paddingBottom: 0 }
                : figureRowStyle
            }
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={figureValueStyle}>{f.value}</div>
              <div style={figureLabelStyle}>
                {f.label}
                {f.sub && <div style={figureSubStyle}>{f.sub}</div>}
                {/* On phones, which have no hover, the definition is shown
                    under the label instead of in the info tooltip. */}
                <div className="d-md-none" style={figureDefinitionStyle}>
                  {f.definition}
                </div>
              </div>
              {/* From md, the site's info tooltip (components/tooltip.tsx). */}
              <span className="d-none d-md-inline-flex">
                <InfoTooltip text={f.definition} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </LobbyingPanel>
  )
}

// ── Payments by session ───────────────────────────────────────────────────────

// paid is null for sessions whose disclosures didn't report per-client
// compensation (2005–2009), so the chart shows no bar rather than $0.
type SessionPaid = { court: number; paid: number | null }

function sessionPaid(stats: OverviewStats): SessionPaid[] {
  return [...stats.courtsWithData]
    .sort((a, b) => a - b)
    .map(court => {
      const start = courtStartYear(court)
      const years = [start, start + 1]
        .map(y => stats.spendByYear[String(y)])
        .filter((v): v is number => v !== undefined)
      return {
        court,
        paid: years.length ? years.reduce((s, v) => s + v, 0) : null
      }
    })
}

const STRIPE = {
  selected: [MAPLE_COLORS.primary, MAPLE_COLORS.periwinkle],
  other: [MAPLE_COLORS.periwinkle, MAPLE_COLORS.blueBorder]
} as const

function PaymentsChart({
  data,
  spendByYear,
  session,
  current,
  onSelect
}: {
  data: SessionPaid[]
  spendByYear: OverviewStats["spendByYear"]
  session: SessionFilter
  current: number
  onSelect: (court: number) => void
}) {
  const { t } = useTranslation("lobbying")
  const reducedMotion = usePrefersReducedMotion()
  // Compensation by client starts the year after these.
  const firstPaid = Math.min(...Object.keys(spendByYear).map(Number))
  const kind = (court: number) =>
    session === "all" || court === session ? "selected" : "other"
  const amount = (d: SessionPaid) =>
    t(
      d.court === current
        ? "overview.chartAmountSoFar"
        : "overview.chartAmount",
      { amount: formatCurrency(d.paid ?? 0) }
    )

  return (
    <LobbyingPanel
      title={t("overview.chartTitle")}
      hint={t("overview.chartHint")}
      style={{ height: "100%", marginBottom: 0 }}
    >
      <div
        role="img"
        aria-label={t("overview.chartLabel", {
          bars: data
            .filter(d => d.paid !== null)
            .map(d => `${courtName(d.court)}: ${amount(d)}`)
            .join("; ")
        })}
        style={{ height: 280 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              {Object.entries(STRIPE).map(([name, [a, b]]) => (
                <pattern
                  key={name}
                  id={`session-in-progress-${name}`}
                  width={8}
                  height={8}
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width={8} height={8} fill={b} />
                  <rect width={4} height={8} fill={a} />
                </pattern>
              ))}
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis
              dataKey="court"
              {...X_AXIS_PROPS}
              tickFormatter={c => courtYears(Number(c))}
            />
            <YAxis {...Y_AXIS_PROPS} tickFormatter={formatCurrencyCompact} />
            <Tooltip
              cursor={{ fill: MAPLE_COLORS.graySubtleBg }}
              content={props => (
                <MapleTooltip
                  {...props}
                  labelFormatter={c => courtName(Number(c))}
                  valueFormatter={v =>
                    amount({ court: Number(props.label), paid: Number(v) })
                  }
                />
              )}
            />
            <Bar
              dataKey="paid"
              name={t("activity.reportedPaid")}
              isAnimationActive={!reducedMotion}
              {...BAR_PROPS}
            >
              {data.map(d => (
                <Cell
                  key={d.court}
                  cursor="pointer"
                  onClick={() => onSelect(d.court)}
                  fill={
                    d.court === current
                      ? `url(#session-in-progress-${kind(d.court)})`
                      : STRIPE[kind(d.court)][0]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Closer to the axis, and the note to it, than the panel's 0.875rem
          between its parts. */}
      <ul
        style={{
          ...legendStyle,
          justifyContent: "center",
          marginTop: "-0.375rem"
        }}
      >
        <li style={legendItemStyle}>
          <LegendSwatch background={MAPLE_COLORS.primary} />
          {t(
            session === "all" ? "overview.legendAll" : "overview.legendSelected"
          )}
        </li>
        {session !== "all" && (
          <li style={legendItemStyle}>
            <LegendSwatch background={MAPLE_COLORS.periwinkle} />
            {t("overview.legendOther")}
          </li>
        )}
        <li style={legendItemStyle}>
          <LegendSwatch
            background={`repeating-linear-gradient(135deg, ${STRIPE.other[0]} 0 3px, ${STRIPE.other[1]} 3px 6px)`}
          />
          {t("overview.legendInProgress")}
        </li>
      </ul>
      {firstPaid > FIRST_YEAR && Number.isFinite(firstPaid) && (
        <p
          style={{
            color: MAPLE_COLORS.textMuted,
            fontSize: 12,
            margin: "-0.375rem 0 0",
            textAlign: "center"
          }}
        >
          {t("explainers.spendNotReported", {
            years:
              firstPaid - 1 === FIRST_YEAR
                ? String(FIRST_YEAR)
                : `${FIRST_YEAR}–${firstPaid - 1}`
          })}
        </p>
      )}
    </LobbyingPanel>
  )
}

// ── Most-lobbied bills ────────────────────────────────────────────────────────

function TopBills({
  session,
  topBills
}: {
  session: SessionFilter
  topBills: OverviewProps["topBills"]
}) {
  const { t } = useTranslation("lobbying")
  // Sortable by organizations, as the Lobbied Bills list is.
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  // The most-lobbied bills overall are among each session's most-lobbied.
  const top = useMemo(() => {
    const rows =
      session === "all"
        ? Object.values(topBills)
            .flat()
            .sort((a, b) => b.clients - a.clients)
            .slice(0, TOP_BILLS)
        : topBills[String(session)] ?? []
    const mul = sortDir === "asc" ? 1 : -1
    return [...rows].sort((a, b) => mul * (a.clients - b.clients))
  }, [session, topBills, sortDir])
  return (
    <LobbyingPanel
      title={t("overview.topBills")}
      hint={t("overview.topBillsHint")}
      session={session}
      sessions={Object.keys(topBills).map(Number)}
      aside={
        // The counts' size (the list pages' corners), a chevron after it.
        <a
          href={`/lobbying/bills?session=${session}`}
          className={lobbyingStyles.quietLink}
          style={{ fontWeight: 700, fontSize: 16, color: MAPLE_COLORS.primary }}
        >
          {/* The selected session's years, as the panel's title has them. */}
          {t("overview.topBillsLink", {
            years: sessionYears(session, Object.keys(topBills).map(Number))
          })}
          <FontAwesomeIcon
            icon={faChevronRight}
            aria-hidden
            style={{ fontSize: "0.75em", marginLeft: "0.35em" }}
          />
        </a>
      }
    >
      {top.length === 0 ? (
        <p style={{ color: MAPLE_COLORS.textMuted, margin: 0 }}>
          {t("noData")}
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          {/* As the Lobbied Bills list's table (pages/lobbying/bills/
              index.tsx), less its activities line. */}
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
                  onSort={() => setSortDir(d => (d === "asc" ? "desc" : "asc"))}
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
              {top.map(b => (
                <TopBillRow
                  key={`${b.court}-${b.billId}`}
                  bill={b}
                  showSession={session === "all"}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PositionLegend multiple note={t("bill.orgCountNote")} />
    </LobbyingPanel>
  )
}

function TopBillRow({
  bill,
  showSession
}: {
  bill: BillRow
  showSession: boolean
}) {
  return (
    <tr>
      <td style={listTdStyle}>
        <a
          href={`/lobbying/bills/${bill.court}/${bill.billId}`}
          style={{ color: MAPLE_COLORS.primary, fontWeight: 700, fontSize: 16 }}
        >
          {bill.billId}
        </a>
        {showSession && (
          <div style={subTextStyle}>{courtShortLabel(bill.court)}</div>
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
        {bill.title || "—"}
      </td>
      <td style={listTdStyle}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>
          {bill.clients || "—"}
        </div>
      </td>
      <td style={{ ...listTdStyle, paddingTop: "1.1rem" }}>
        <PositionBar
          width={160}
          height={12}
          counts={billPositionCounts(bill)}
        />
      </td>
    </tr>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type OverviewProps = {
  // Null before any stats exist.
  stats: OverviewStats | null
  // Each session's most-lobbied bills, by General Court number.
  topBills: Record<string, BillRow[]>
}

function LobbyingOverview({ stats, topBills }: OverviewProps) {
  const { t } = useTranslation("lobbying")
  const current = stats ? latestCourt(stats) : undefined
  // The latest session until one is chosen.
  const [chosen, setChosen] = useState<SessionFilter | null>(null)
  const session: SessionFilter | undefined = chosen ?? current
  const paidBySession = useMemo(
    () => (stats ? sessionPaid(stats) : []),
    [stats]
  )
  const totalPaid = useMemo(
    () =>
      stats ? Object.values(stats.spendByYear).reduce((s, v) => s + v, 0) : 0,
    [stats]
  )
  const sessions = useMemo(
    () => sessionsNewestFirst(stats ?? undefined),
    [stats]
  )

  return (
    <>
      <LobbyingSubnav />
      <Container>
        {/* 1.5rem from the subtitle to the session select, its 0.5rem and
            mb-3: the space the cards below keep between them (g-4). */}
        <Row className="mb-3" style={{ marginTop: "1.875rem" }}>
          <Col>
            <h1>{t("titles.overview")}</h1>
            <p style={{ ...pageIntroStyle, marginBottom: "0.5rem" }}>
              {t("subtitle")}
            </p>
          </Col>
        </Row>

        {!stats && (
          <p style={{ color: MAPLE_COLORS.textMuted }}>{t("noData")}</p>
        )}

        {stats && session !== undefined && current !== undefined && (
          <>
            {/* The session select as wide as Key Figures, over it: 1.5rem above
                the cards, its bar's 1rem and mb-2, as the cards are apart and
                as they are above Most-Lobbied Bills. */}
            <Row className="g-4 mb-2">
              <Col lg={5} className={lobbyingStyles.overviewLeft}>
                <LobbyingFilterBar boxed="open">
                  <SessionSelect
                    id="overview-session"
                    sessions={sessions}
                    value={session}
                    onChange={setChosen}
                    current={current}
                    allLabel={t("filters.allSessionsSince")}
                    style={{ ...sessionSelectStyle, width: "100%" }}
                    fill
                  />
                </LobbyingFilterBar>
              </Col>
            </Row>

            {/* Key Figures and the chart beside it, their tops level. Each
                panel fills its column's height, so neither keeps the panels'
                1.5rem margin under it, which the column's height took in and
                the panel then filled as empty space inside; the row's own
                margin (mb-4, 1.5rem) puts the same space below them as between
                and above them. */}
            <Row className="g-4 mb-4">
              <Col lg={5} className={lobbyingStyles.overviewLeft}>
                <KeyFigures
                  stats={stats}
                  session={session}
                  totalPaid={totalPaid}
                />
              </Col>
              <Col lg={7} className={lobbyingStyles.overviewRight}>
                <PaymentsChart
                  data={paidBySession}
                  spendByYear={stats.spendByYear}
                  session={session}
                  current={current}
                  onSelect={setChosen}
                />
              </Col>
            </Row>

            <TopBills session={session} topBills={topBills} />
          </>
        )}

        <Row className="mb-3">
          <Col>
            <p style={dataNotesStyle}>
              Compensation figures reflect amounts reported by registered
              lobbyists and employers to the Massachusetts Secretary of State
              under{" "}
              <a
                href="https://malegislature.gov/Laws/GeneralLaws/PartI/TitleI/Chapter3"
                target="_blank"
                rel="noreferrer"
              >
                MGL Chapter 3
              </a>
              . The dataset spans{" "}
              {stats ? stats.courtsWithData.length : "multiple"} legislative
              sessions (General Courts), beginning in 2005, the first year
              available on the portal. The sharp increase in reported activity
              starting in 2010 coincides with{" "}
              <a
                href="https://malegislature.gov/Laws/SessionLaws/Acts/2009/Chapter28"
                target="_blank"
                rel="noreferrer"
              >
                Chapter 28 of the Acts of 2009
              </a>
              , which significantly expanded lobbying disclosure requirements.
              Apparent increases in compensation and disclosure filings in 2014
              and 2019 likely reflect changes in how the portal records activity
              rather than real-world shifts in lobbying volume.
            </p>
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
  Page: LobbyingOverview
})

export const getStaticProps = createLobbyingListProps<OverviewProps>(
  async () => {
    const stats = await fetchLobbyingStats()
    if (!stats) return { stats: null, topBills: {} }
    const tops = await Promise.all(
      stats.courtsWithData.map(court => fetchTopBillRows(court, TOP_BILLS))
    )
    return {
      stats: omit(stats, "filingsByYear"),
      topBills: Object.fromEntries(
        stats.courtsWithData.map((court, i) => [String(court), tops[i]])
      )
    }
  }
)

// ── Styles ────────────────────────────────────────────────────────────────────

const figureRowStyle: React.CSSProperties = {
  // More room in each row than the 0.75rem it had.
  padding: "1.25rem 0",
  borderTop: `1px dashed ${MAPLE_COLORS.borderDefault}`
}

const figureValueStyle: React.CSSProperties = {
  flex: "none",
  // Room for "$162.3M" at 24px.
  width: 108,
  fontSize: 24,
  // A step under bold, as the tables' figures (the Clients list).
  fontWeight: 600,
  lineHeight: 1,
  color: MAPLE_COLORS.primary
}

const figureLabelStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  // Clear of the info icon at the row's end.
  paddingRight: "0.75rem",
  // Lighter, as the list counts' words: the figure carries the weight, the
  // label names it.
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 1.3,
  color: MAPLE_COLORS.textStrong
}

// The definition: the subtext's grey and size, light, its own paragraph.
const figureDefinitionStyle: React.CSSProperties = {
  marginTop: 4,
  fontSize: 13,
  fontWeight: 300,
  lineHeight: 1.45,
  letterSpacing: "0.015em",
  color: MAPLE_COLORS.textMuted
}

// Light, in the muted grey, spaced as the panels' hints.
const figureSubStyle: React.CSSProperties = {
  marginTop: 2,
  fontSize: 13,
  fontWeight: 300,
  letterSpacing: "0.015em",
  color: MAPLE_COLORS.textMuted
}

const dataNotesStyle: React.CSSProperties = {
  fontSize: 13,
  color: MAPLE_COLORS.textMuted,
  lineHeight: 1.6
}
