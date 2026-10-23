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
  FilterLabel,
  LobbyingFilterBar,
  LobbyingPanel,
  sessionSelectStyle
} from "components/lobbying/LobbyingPanel"
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"
import {
  LegendSwatch,
  legendItemStyle,
  legendStyle,
  PositionBar,
  PositionLegend
} from "components/lobbying/PositionBar"
import {
  SessionSelect,
  type SessionFilter
} from "components/lobbying/SessionSelect"
import {
  courtName,
  courtOrdinal,
  courtShortLabel,
  courtStartYear
} from "components/lobbying/sessions"
import { thStyle } from "components/lobbying/SortTh"

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
  const where =
    session === "all"
      ? t("overview.whereAll")
      : t("overview.whereSession", { session: courtName(session) })
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
          : t("overview.figLobbyistsSub", { firms: formatCount(firms) }),
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
  const [open, setOpen] = useState<Set<number>>(new Set())
  const toggle = (i: number) =>
    setOpen(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <LobbyingPanel
      title={t("overview.keyFigures", {
        session:
          session === "all" ? t("filters.allSessionsSince") : courtName(session)
      })}
      style={{ height: "100%", gap: 0 }}
    >
      <div>
        {figures.map((f, i) => {
          const isOpen = open.has(i)
          const defId = `key-figure-def-${i}`
          return (
            <div key={f.label} style={figureRowStyle}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <div style={figureValueStyle}>{f.value}</div>
                <div style={figureLabelStyle}>
                  {f.label}
                  {f.sub && <div style={figureSubStyle}>{f.sub}</div>}
                </div>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={defId}
                  aria-label={t("overview.defToggle", { label: f.label })}
                  onClick={() => toggle(i)}
                  style={infoButtonStyle(isOpen)}
                >
                  i
                </button>
              </div>
              {isOpen && (
                <p id={defId} style={figureDefStyle}>
                  {f.definition}
                </p>
              )}
            </div>
          )
        })}
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
      aside={t("overview.chartHint")}
      style={{ height: "100%" }}
    >
      <div
        role="img"
        aria-label={t("overview.chartLabel", {
          bars: data
            .filter(d => d.paid !== null)
            .map(d => `${courtName(d.court)}: ${amount(d)}`)
            .join("; ")
        })}
        style={{ height: 300 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
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
              tickFormatter={c => courtOrdinal(Number(c))}
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
      <ul style={legendStyle}>
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
        <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 12, margin: 0 }}>
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
  // The most-lobbied bills overall are among each session's most-lobbied.
  const top = useMemo(
    () =>
      session === "all"
        ? Object.values(topBills)
            .flat()
            .sort((a, b) => b.clients - a.clients)
            .slice(0, TOP_BILLS)
        : topBills[String(session)] ?? [],
    [session, topBills]
  )
  return (
    <LobbyingPanel
      title={t("overview.topBills", {
        session:
          session === "all" ? t("filters.allSessionsSince") : courtName(session)
      })}
      aside={
        <a
          href={`/lobbying/bills?session=${session}`}
          style={{ fontWeight: 700, color: MAPLE_COLORS.primary }}
        >
          {t("overview.topBillsLink")}
        </a>
      }
    >
      <p
        style={{ margin: 0, fontSize: 14, color: MAPLE_COLORS.graySubtleText }}
      >
        {t("overview.topBillsHint")}
      </p>
      {top.length === 0 ? (
        <p style={{ color: MAPLE_COLORS.textMuted, margin: 0 }}>
          {t("noData")}
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>{t("fields.bill")}</th>
                <th style={thStyle}>{t("overview.orgsReporting")}</th>
                <th style={thStyle}>
                  {t("overview.positionsReported")}{" "}
                  <span style={{ textTransform: "none", fontWeight: 400 }}>
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
      <PositionLegend />
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
      <td style={tdStyle}>
        <a
          href={`/lobbying/bills/${bill.court}/${bill.billId}`}
          style={{ fontWeight: 700, color: MAPLE_COLORS.primary }}
        >
          {bill.billId}
        </a>
        {showSession && (
          <span style={{ fontSize: 13, color: MAPLE_COLORS.graySubtleText }}>
            {" "}
            · {courtShortLabel(bill.court)}
          </span>
        )}
        {bill.title && (
          <div title={bill.title} style={clampedTitleStyle}>
            {bill.title}
          </div>
        )}
      </td>
      <td style={{ ...tdStyle, fontWeight: 700 }}>{bill.clients}</td>
      <td style={{ ...tdStyle, verticalAlign: "middle" }}>
        <PositionBar
          width={160}
          counts={{
            support: bill.orgSupport,
            oppose: bill.orgOppose,
            neutral: bill.orgNeutral
          }}
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
    () => [...(stats?.courtsWithData ?? [])].sort((a, b) => b - a),
    [stats]
  )

  return (
    <>
      <LobbyingSubnav />
      <Container>
        <Row className="mt-4 mb-3">
          <Col>
            <h1>{t("titles.overview")}</h1>
            <p style={{ color: MAPLE_COLORS.textMuted }}>{t("subtitle")}</p>
          </Col>
        </Row>

        {!stats && (
          <p style={{ color: MAPLE_COLORS.textMuted }}>{t("noData")}</p>
        )}

        {stats && session !== undefined && current !== undefined && (
          <>
            <LobbyingFilterBar boxed>
              <FilterLabel htmlFor="overview-session">
                {t("filters.session")}
              </FilterLabel>
              <SessionSelect
                id="overview-session"
                sessions={sessions}
                value={session}
                onChange={setChosen}
                current={current}
                allLabel={t("filters.allSessionsSince")}
                style={sessionSelectStyle}
              />
            </LobbyingFilterBar>

            <Row className="g-4 mb-4">
              <Col lg={5} xl={4}>
                <KeyFigures
                  stats={stats}
                  session={session}
                  totalPaid={totalPaid}
                />
              </Col>
              <Col lg={7} xl={8}>
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
  padding: "0.75rem 0",
  borderTop: `1px dashed ${MAPLE_COLORS.borderDefault}`
}

const figureValueStyle: React.CSSProperties = {
  flex: "none",
  width: 118,
  fontSize: 26,
  fontWeight: 700,
  lineHeight: 1.1,
  color: MAPLE_COLORS.primary
}

const figureLabelStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.3,
  color: MAPLE_COLORS.textStrong
}

const figureSubStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 400,
  color: MAPLE_COLORS.graySubtleText
}

const figureDefStyle: React.CSSProperties = {
  margin: "0.375rem 0 0 130px",
  fontSize: 13,
  lineHeight: 1.45,
  color: MAPLE_COLORS.graySubtleText
}

const infoButtonStyle = (open: boolean): React.CSSProperties => ({
  flex: "none",
  width: 24,
  height: 24,
  padding: 0,
  borderRadius: 999,
  border: `1px solid ${MAPLE_COLORS.textMuted}`,
  background: open ? MAPLE_COLORS.primary : MAPLE_COLORS.surfaceBase,
  color: open ? MAPLE_COLORS.surfaceBase : MAPLE_COLORS.graySubtleText,
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1,
  cursor: "pointer"
})

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
  color: MAPLE_COLORS.textBody
}

const tdStyle: React.CSSProperties = {
  padding: "0.75rem",
  verticalAlign: "top",
  borderTop: `1px solid ${MAPLE_COLORS.borderSubtle}`
}

// Appropriations titles run to several lines; two are enough here.
const clampedTitleStyle: React.CSSProperties = {
  fontSize: 13,
  color: MAPLE_COLORS.graySubtleText,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
}

const dataNotesStyle: React.CSSProperties = {
  fontSize: 13,
  color: MAPLE_COLORS.textMuted,
  lineHeight: 1.6
}
