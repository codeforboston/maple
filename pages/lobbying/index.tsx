import React, { useMemo } from "react"
import { useTranslation } from "next-i18next"
import { Col, Container, Row } from "components/bootstrap"
import {
  Bar,
  CartesianGrid,
  ComposedChart,
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
  X_AXIS_PROPS,
  Y_AXIS_PROPS
} from "components/lobbying/chartTheme"
import { LobbyingAttribution } from "components/lobbying/LobbyingAttribution"

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value
}: {
  label: string
  value: string | number | undefined
}) {
  return (
    <div style={statCardStyle}>
      <div style={statValueStyle}>
        {value ?? <span style={{ color: MAPLE_COLORS.borderDefault }}>—</span>}
      </div>
      <div style={statLabelStyle}>{label}</div>
    </div>
  )
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
      />
      <StatCard
        label={t("stats.totalClients")}
        value={stats ? stats.totalClients.toLocaleString("en-US") : undefined}
      />
      <StatCard
        label={t("stats.sessionsCovered")}
        value={stats ? stats.courtsWithData.length : undefined}
      />
      <StatCard label={t("stats.totalSpend")} value={totalSpend} />
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

  if (!stats || data.length === 0) return null

  return (
    <ChartContainer
      title={`${t("fields.amount")} & ${t("fields.filings")} by ${t(
        "filters.year"
      )}`}
      height={240}
      className="mb-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 48, left: 0, bottom: 0 }}
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
            width={48}
            tickFormatter={formatCount}
          />
          <Tooltip
            content={props => (
              <MapleTooltip
                {...props}
                labelFormatter={y => `${y}`}
                valueFormatter={v => {
                  const n = Number(v)
                  return n > 10_000 ? formatCurrency(n) : formatCount(n)
                }}
              />
            )}
          />
          <Bar
            yAxisId="spend"
            dataKey="spend"
            name={t("fields.amount")}
            fill={MAPLE_COLORS.periwinkle}
            {...BAR_PROPS_COMPACT}
          />
          <Line
            yAxisId="filings"
            dataKey="filings"
            name={t("fields.filings")}
            stroke={MAPLE_COLORS.primary}
            {...LINE_PROPS_EMPHASIS}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

// ── Entry cards ───────────────────────────────────────────────────────────────

function EntryCard({
  title,
  description,
  href,
  count,
  countLabel
}: {
  title: string
  description: string
  href: string
  count?: number
  countLabel?: string
}) {
  return (
    <a href={href} style={entryCardStyle}>
      <div style={entryCardInner}>
        <div>
          <div style={entryCardTitle}>{title}</div>
          <div style={entryCardDesc}>{description}</div>
        </div>
        {count != null && (
          <div style={entryCardCount}>
            {count.toLocaleString("en-US")}
            {countLabel && (
              <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4 }}>
                {countLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </a>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function LobbyingOverview() {
  const { t } = useTranslation("lobbying")
  const { result: stats, status } = useLobbyingStats()
  const loading = status === "loading" || status === "not-requested"

  return (
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

      {/* Entry cards */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <EntryCard
            title={t("sections.bills")}
            description={t("titles.bills")}
            href="/lobbying/bills"
            count={stats?.totalBillsWithFilings}
            countLabel={t("sections.bills").toLowerCase()}
          />
        </Col>
        <Col md={4} className="mb-3">
          <EntryCard
            title={t("sections.clients")}
            description={t("titles.clients")}
            href="/lobbying/clients"
            count={stats?.totalClients}
            countLabel={t("sections.clients").toLowerCase()}
          />
        </Col>
        <Col md={4} className="mb-3">
          <EntryCard
            title={t("sections.firms")}
            description={t("titles.firms")}
            href="/lobbying/firms"
            count={stats?.totalRegistrants}
            countLabel="registrants"
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <LobbyingAttribution />
        </Col>
      </Row>
    </Container>
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

const entryCardStyle: React.CSSProperties = {
  display: "block",
  background: MAPLE_COLORS.surfaceBase,
  border: `1px solid ${MAPLE_COLORS.borderDefault}`,
  borderRadius: 8,
  padding: "1.25rem",
  textDecoration: "none",
  color: MAPLE_COLORS.textBody,
  boxShadow: "0 0.25rem 1rem rgba(15, 23, 42, 0.04)",
  transition: "box-shadow 0.15s, border-color 0.15s",
  height: "100%"
}

const entryCardInner: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start"
}

const entryCardTitle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 16,
  color: MAPLE_COLORS.primary
}

const entryCardDesc: React.CSSProperties = {
  fontSize: 13,
  color: MAPLE_COLORS.textMuted,
  marginTop: "0.2rem"
}

const entryCardCount: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: MAPLE_COLORS.textStrong,
  fontFamily: "Nunito, system-ui, sans-serif",
  whiteSpace: "nowrap"
}
