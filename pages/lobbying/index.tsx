import React, { useMemo } from "react"
import { useTranslation } from "next-i18next"
import { Col, Container, Row } from "components/bootstrap"
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import { useLobbyingStats } from "components/db/lobbying"
import type { LobbyingStats } from "functions/src/lobbying/types"
import {
  BAR_PROPS_COMPACT,
  ChartContainer,
  formatCount,
  formatCurrency,
  formatCurrencyCompact,
  GRID_PROPS,
  LINE_PROPS_EMPHASIS,
  MAPLE_COLORS,
  MapleTooltip,
  usePrefersReducedMotion,
  X_AXIS_PROPS,
  Y_AXIS_PROPS
} from "components/lobbying/chartTheme"
import { LobbyingAttribution } from "components/lobbying/LobbyingAttribution"
import { LobbyingSubnav } from "components/lobbying/LobbyingSubnav"

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  href,
  description
}: {
  label: string
  value: string | number | undefined
  href?: string
  description?: string
}) {
  const inner = (
    <>
      <div style={statValueStyle}>
        {value ?? <span style={{ color: MAPLE_COLORS.borderDefault }}>—</span>}
      </div>
      <div style={statLabelStyle}>{label}</div>
      {description && <div style={statDescStyle}>{description}</div>}
    </>
  )
  if (href) {
    return (
      <a href={href} style={{ ...statCardStyle, textDecoration: "none" }}>
        {inner}
      </a>
    )
  }
  return <div style={statCardStyle}>{inner}</div>
}

function StatsBar({ stats }: { stats: LobbyingStats | undefined }) {
  const { t } = useTranslation("lobbying")

  const totalSpend = useMemo(() => {
    if (!stats) return undefined
    const total = Object.values(stats.spendByYear).reduce((s, v) => s + v, 0)
    return total > 0 ? formatCurrency(total) : undefined
  }, [stats])

  return (
    <div style={statsRowStyle}>
      <StatCard
        label={t("stats.totalBills")}
        value={
          stats
            ? stats.totalBillsWithFilings.toLocaleString("en-US")
            : undefined
        }
        href="/lobbying/bills"
        description={t("explainers.statBills")}
      />
      <StatCard
        label={t("stats.totalClients")}
        value={stats ? stats.totalClients.toLocaleString("en-US") : undefined}
        href="/lobbying/clients"
        description={t("explainers.statClients")}
      />
      <StatCard
        label={t("stats.totalFirms")}
        value={
          stats ? stats.totalRegistrants.toLocaleString("en-US") : undefined
        }
        href="/lobbying/firms"
        description={t("explainers.firms")}
      />
      <StatCard
        label={t("stats.totalSpend")}
        value={totalSpend}
        description={t("explainers.statSpend")}
      />
    </div>
  )
}

// ── Spend + filings chart ─────────────────────────────────────────────────────

type YearRow = { year: number; spend: number; filings: number }

function buildYearData(stats: LobbyingStats): YearRow[] {
  const years = new Set([
    ...Object.keys(stats.spendByYear),
    ...Object.keys(stats.filingsByYear)
  ])
  return [...years]
    .map(y => ({
      year: Number(y),
      spend: stats.spendByYear[y] ?? 0,
      filings: stats.filingsByYear[y] ?? 0
    }))
    .filter(r => r.year >= 2005)
    .sort((a, b) => a.year - b.year)
}

function SpendFilingsChart({ stats }: { stats: LobbyingStats | undefined }) {
  const { t } = useTranslation("lobbying")
  const data = useMemo(() => (stats ? buildYearData(stats) : []), [stats])
  const reducedMotion = usePrefersReducedMotion()

  if (!stats || data.length === 0) return null

  const axisLabelStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    fontSize: 11,
    fontWeight: 700,
    color: MAPLE_COLORS.textMuted,
    fontFamily: "Nunito, system-ui, sans-serif",
    pointerEvents: "none",
    lineHeight: 1
  }

  return (
    <ChartContainer
      title={`${t("fields.amount")} & ${t("fields.filings")} by ${t(
        "filters.year"
      )}`}
      height={260}
      className="mb-4"
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <span style={{ ...axisLabelStyle, left: 4 }}>{t("fields.amount")}</span>
        <span style={{ ...axisLabelStyle, right: 52 }}>
          {t("fields.filings")}
        </span>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 16, right: 48, left: 0, bottom: 4 }}
          >
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="year" {...X_AXIS_PROPS} />
            <YAxis
              yAxisId="spend"
              orientation="left"
              {...Y_AXIS_PROPS}
              tickFormatter={formatCurrencyCompact}
            />
            <YAxis
              yAxisId="filings"
              orientation="right"
              tick={{
                fill: MAPLE_COLORS.textMuted,
                fontSize: 12,
                fontFamily: "Nunito, system-ui, sans-serif"
              }}
              axisLine={false}
              tickLine={false}
              width={56}
              tickFormatter={formatCount}
            />
            <Legend
              wrapperStyle={{
                fontSize: 12,
                fontFamily: "Nunito, system-ui, sans-serif",
                color: MAPLE_COLORS.textMuted,
                paddingTop: 4
              }}
            />
            <Tooltip
              content={props => (
                <MapleTooltip
                  {...props}
                  labelFormatter={y => `${y}`}
                  valueFormatter={(v, key) =>
                    key === "filings"
                      ? formatCount(Number(v))
                      : formatCurrency(Number(v))
                  }
                />
              )}
            />
            <Bar
              yAxisId="spend"
              dataKey="spend"
              name={t("fields.amount")}
              fill={MAPLE_COLORS.periwinkle}
              isAnimationActive={!reducedMotion}
              {...BAR_PROPS_COMPACT}
            />
            <Line
              yAxisId="filings"
              dataKey="filings"
              name={t("fields.filings")}
              stroke={MAPLE_COLORS.primary}
              isAnimationActive={!reducedMotion}
              {...LINE_PROPS_EMPHASIS}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function LobbyingOverview() {
  const { t } = useTranslation("lobbying")
  const { result: stats, status } = useLobbyingStats()
  const loading = status === "loading" || status === "not-requested"

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

        {/* Stats */}
        <Row className="mb-4">
          <Col>
            {loading ? (
              <p style={{ color: MAPLE_COLORS.textMuted, fontSize: 13 }}>
                {t("loading")}
              </p>
            ) : (
              <StatsBar stats={stats} />
            )}
          </Col>
        </Row>

        {/* Chart */}
        {!loading && stats && (
          <Row className="mb-4">
            <Col>
              <SpendFilingsChart stats={stats} />
            </Col>
          </Row>
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

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "lobbying"
])

// ── Styles ────────────────────────────────────────────────────────────────────

const statsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap"
}

const statCardStyle: React.CSSProperties = {
  flex: "1 1 160px",
  background: MAPLE_COLORS.surfaceBase,
  border: `1px solid ${MAPLE_COLORS.borderDefault}`,
  borderRadius: 8,
  padding: "1rem 1.25rem",
  boxShadow: "0 0.25rem 1rem rgba(15, 23, 42, 0.04)"
}

const statValueStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: MAPLE_COLORS.primary,
  fontFamily: "Nunito, system-ui, sans-serif",
  lineHeight: 1.2
}

const statLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: MAPLE_COLORS.textMuted,
  marginTop: "0.25rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontWeight: 600
}

const statDescStyle: React.CSSProperties = {
  fontSize: 11,
  color: MAPLE_COLORS.textMuted,
  marginTop: "0.4rem",
  lineHeight: 1.4,
  fontWeight: 400
}

const dataNotesStyle: React.CSSProperties = {
  fontSize: 13,
  color: MAPLE_COLORS.textMuted,
  lineHeight: 1.6
}
