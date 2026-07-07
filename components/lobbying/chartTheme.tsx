/**
 * Recharts visual theme for MAPLE lobbying charts.
 *
 * All values are derived from the design tokens in styles/bootstrap.scss.
 * CSS custom properties (var(--maple-*)) are not used here because Recharts
 * renders into SVG/Canvas where CSS vars are not reliably resolved — hard-coded
 * hex values that match the SCSS source of truth are the correct approach.
 */

import React from "react"
import { TooltipContentProps } from "recharts"
import type {
  NameType,
  Payload,
  ValueType
} from "recharts/types/component/DefaultTooltipContent"

// ── Token mirrors ─────────────────────────────────────────────────────────────
// Keep in sync with styles/bootstrap.scss.

export const MAPLE_COLORS = {
  // Brand
  primary: "#1a3185",
  primaryStrong: "#12266f",
  accent: "#ff8600",
  danger: "#c71e32",
  green: "#3d9922",
  stagePast: "#8ebc81",
  periwinkle: "#8c98c2",

  // Text
  textBody: "#334155",
  textMuted: "#64748b",
  textStrong: "#1e293b",

  // Surfaces & borders
  surfaceBase: "#ffffff",
  surfacePage: "#eae7e7",
  surfaceMuted: "#f8fafc",
  borderDefault: "rgba(15, 23, 42, 0.15)",
  borderSubtle: "rgba(15, 23, 42, 0.08)",

  // Semantic subtle tints
  blueSubtleBg: "#e8efff",
  blueSubtleText: "#1d3f8a",
  greenSubtleBg: "#e8f6ea",
  greenSubtleText: "#1d5d2d",
  redSubtleBg: "#fde8ef",
  redSubtleText: "#902141",
  graySubtleBg: "#f1f5f9",
  graySubtleText: "#475569",
  graySubtleBorder: "#d7e0ea"
} as const

// ── Data palettes ─────────────────────────────────────────────────────────────

/** Ordered series palette: navy → orange → green → periwinkle → soft green → red */
export const DATA_PALETTE: readonly string[] = [
  MAPLE_COLORS.primary,
  MAPLE_COLORS.accent,
  MAPLE_COLORS.green,
  MAPLE_COLORS.periwinkle,
  MAPLE_COLORS.stagePast,
  MAPLE_COLORS.danger
]

/** Lobbying position colours. Use across all position visualisations. */
export const POSITION_COLORS = {
  support: MAPLE_COLORS.green,
  oppose: MAPLE_COLORS.danger,
  neutral: MAPLE_COLORS.textMuted,
  none: MAPLE_COLORS.graySubtleBorder
} as const

export type LobbyingPosition = keyof typeof POSITION_COLORS

// ── Axis / grid props ─────────────────────────────────────────────────────────
// Spread directly onto <XAxis>, <YAxis>, <CartesianGrid>.

const TICK_STYLE = {
  fill: MAPLE_COLORS.textMuted,
  fontSize: 12,
  fontFamily: "Nunito, system-ui, sans-serif"
}

export const X_AXIS_PROPS = {
  tick: TICK_STYLE,
  axisLine: { stroke: MAPLE_COLORS.borderDefault },
  tickLine: { stroke: MAPLE_COLORS.borderDefault },
  padding: { left: 4, right: 4 } as const
}

export const Y_AXIS_PROPS = {
  tick: TICK_STYLE,
  axisLine: false as const,
  tickLine: false as const,
  width: 60
}

export const GRID_PROPS = {
  strokeDasharray: "3 3",
  stroke: MAPLE_COLORS.borderSubtle,
  vertical: false
}

// ── Line styles ───────────────────────────────────────────────────────────────

/** Standard line. Spread onto <Line>. */
export const LINE_PROPS = {
  strokeWidth: 2,
  dot: false as const,
  activeDot: { r: 5, strokeWidth: 2, stroke: MAPLE_COLORS.surfaceBase }
}

/** Emphasis line (e.g. total / primary series on a dual-axis chart). */
export const LINE_PROPS_EMPHASIS = {
  ...LINE_PROPS,
  strokeWidth: 2.5
}

/** Dashed reference or secondary line. */
export const LINE_PROPS_DASHED = {
  ...LINE_PROPS,
  strokeDasharray: "5 3",
  strokeWidth: 1.5
}

// ── Bar styles ────────────────────────────────────────────────────────────────

/** Rounded top corners matching $maple-radius-sm (4 px). Spread onto <Bar>. */
export const BAR_PROPS = {
  radius: [4, 4, 0, 0] as [number, number, number, number],
  maxBarSize: 48
}

/** Tighter bar for dense / stacked charts. */
export const BAR_PROPS_COMPACT = {
  radius: [2, 2, 0, 0] as [number, number, number, number],
  maxBarSize: 32
}

// ── Area fill gradients ───────────────────────────────────────────────────────

/**
 * Returns an SVG <defs> block defining a vertical gradient for each data series.
 * Place inside the Recharts <AreaChart> / <ComposedChart> and reference with
 * `fill="url(#gradient-primary)"` on each <Area>.
 *
 * Usage:
 *   <AreaChart ...>
 *     <defs>{AREA_GRADIENT_DEFS}</defs>
 *     <Area fill="url(#gradient-primary)" stroke={MAPLE_COLORS.primary} ... />
 *   </AreaChart>
 */
export const AREA_GRADIENT_DEFS = (
  <>
    {DATA_PALETTE.map((color, i) => (
      <linearGradient
        key={i}
        id={`maple-gradient-${i}`}
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop offset="5%" stopColor={color} stopOpacity={0.18} />
        <stop offset="95%" stopColor={color} stopOpacity={0.02} />
      </linearGradient>
    ))}
  </>
)

/** Convenience: gradient fill ID for the nth series in DATA_PALETTE. */
export const gradientFill = (index: number) => `url(#maple-gradient-${index})`

// ── Legend props ──────────────────────────────────────────────────────────────

export const LEGEND_PROPS = {
  wrapperStyle: {
    fontSize: 12,
    fontFamily: "Nunito, system-ui, sans-serif",
    color: MAPLE_COLORS.textMuted,
    paddingTop: 8
  },
  iconSize: 10,
  iconType: "circle" as const
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

/**
 * Drop-in replacement for Recharts' default tooltip.
 * Matches MAPLE card styling: white surface, subtle border and shadow, Nunito.
 *
 * Usage:
 *   <Tooltip content={<MapleTooltip />} />
 *   <Tooltip content={<MapleTooltip labelFormatter={d => `Year: ${d}`} />} />
 */
export const MapleTooltip: React.FC<
  TooltipContentProps<ValueType, NameType> & {
    labelFormatter?: (label: string | number) => React.ReactNode
    valueFormatter?: (value: ValueType) => string
  }
> = ({ active, payload, label, labelFormatter, valueFormatter }) => {
  if (!active || !payload?.length) return null

  const displayLabel =
    labelFormatter && label != null ? labelFormatter(label) : label
  const fmt = valueFormatter ?? ((v: ValueType | undefined) => String(v ?? ""))

  return (
    <div style={tooltipContainerStyle}>
      {displayLabel != null && (
        <div style={tooltipLabelStyle}>{displayLabel}</div>
      )}
      {payload.map((entry: Payload<ValueType, NameType>, i: number) => (
        <div key={i} style={tooltipRowStyle}>
          <span style={{ color: entry.color ?? MAPLE_COLORS.textMuted }}>
            {entry.name}
          </span>
          <span style={{ fontWeight: 600 }}>
            {entry.value != null ? fmt(entry.value) : ""}
          </span>
        </div>
      ))}
    </div>
  )
}

const tooltipContainerStyle: React.CSSProperties = {
  background: MAPLE_COLORS.surfaceBase,
  border: `1px solid ${MAPLE_COLORS.borderDefault}`,
  borderRadius: 8,
  boxShadow: "0 0.5rem 1.5rem rgba(15, 23, 42, 0.06)",
  padding: "0.5rem 0.75rem",
  fontFamily: "Nunito, system-ui, sans-serif",
  fontSize: 13,
  color: MAPLE_COLORS.textBody,
  minWidth: 140
}

const tooltipLabelStyle: React.CSSProperties = {
  fontWeight: 700,
  color: MAPLE_COLORS.textStrong,
  marginBottom: "0.25rem",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em"
}

const tooltipRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
  lineHeight: 1.6
}

// ── Chart container ───────────────────────────────────────────────────────────

/**
 * Wrapper div that gives a Recharts chart the same surface treatment as a
 * MAPLE card: white background, subtle border, sm shadow, md border-radius.
 * Accepts an optional title rendered above the chart area.
 */
export const ChartContainer: React.FC<
  React.PropsWithChildren<{
    title?: string
    height?: number | string
    className?: string
    style?: React.CSSProperties
  }>
> = ({ title, height = 260, children, className, style }) => (
  <div style={{ ...chartContainerStyle, ...style }} className={className}>
    {title && <div style={chartTitleStyle}>{title}</div>}
    <div style={{ height }}>{children}</div>
  </div>
)

const chartContainerStyle: React.CSSProperties = {
  background: MAPLE_COLORS.surfaceBase,
  border: `1px solid ${MAPLE_COLORS.borderDefault}`,
  borderRadius: 8,
  boxShadow: "0 0.25rem 1rem rgba(15, 23, 42, 0.06)",
  padding: "1rem 1rem 0.5rem"
}

const chartTitleStyle: React.CSSProperties = {
  fontFamily: "Nunito, system-ui, sans-serif",
  fontWeight: 700,
  fontSize: 13,
  color: MAPLE_COLORS.textMuted,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "0.75rem"
}

// ── Formatters ────────────────────────────────────────────────────────────────

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
})

export const formatCurrency = (v: number): string => currencyFmt.format(v)

const compactFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1
})

/** Compact axis tick labels: $1.2M, $450K */
export const formatCurrencyCompact = (v: number): string => compactFmt.format(v)

export const formatCount = (v: number): string => v.toLocaleString("en-US")
