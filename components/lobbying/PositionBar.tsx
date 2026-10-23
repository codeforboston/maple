import React from "react"
import { useTranslation } from "next-i18next"
import type { PositionCategory } from "./activity"
import { MAPLE_COLORS, POSITION_COLORS } from "./chartTheme"

type Segment = Exclude<PositionCategory, "none">

const SEGMENTS: Segment[] = ["support", "oppose", "neutral", "multiple"]

// Callers with no "multiple" count (e.g. a bill list row) can leave it out.
export type PositionBarCounts = Omit<Record<Segment, number>, "multiple"> & {
  multiple?: number
}

/**
 * A stacked bar of organizations per position. Hovering a segment shows its
 * count; screen readers get every count from the bar's label. The legend, when
 * shown, repeats the counts as text, which keyboard users can read too.
 */
export function PositionBar({
  counts,
  width = "100%",
  height = 10,
  legend = false
}: {
  counts: PositionBarCounts
  width?: number | string
  height?: number
  legend?: boolean
}) {
  const { t } = useTranslation("lobbying")
  const present = SEGMENTS.filter(s => (counts[s] ?? 0) > 0)
  const total = present.reduce((sum, s) => sum + (counts[s] ?? 0), 0)
  if (total === 0)
    return <span style={{ color: MAPLE_COLORS.textMuted }}>—</span>

  const segmentText = (s: Segment) =>
    t("activity.barSegment", {
      position: t(`position.${s}`),
      count: counts[s] ?? 0
    })

  return (
    <div>
      <div
        role="img"
        aria-label={t("activity.barLabel", {
          counts: present.map(segmentText).join(", ")
        })}
        style={{
          display: "flex",
          width,
          height,
          borderRadius: height / 2,
          overflow: "hidden"
        }}
      >
        {present.map(s => (
          <div
            key={s}
            title={segmentText(s)}
            style={{
              width: `${((counts[s] ?? 0) / total) * 100}%`,
              background: POSITION_COLORS[s]
            }}
          />
        ))}
      </div>
      {legend && (
        <ul style={{ ...legendStyle, marginTop: "0.5rem" }}>
          {present.map(s => (
            <li key={s} style={legendItemStyle}>
              <LegendSwatch background={POSITION_COLORS[s]} />
              {segmentText(s)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** The bar's colors, named, for a list of bars that show no legend each. */
export function PositionLegend({
  multiple = false,
  note
}: {
  multiple?: boolean
  note?: string
}) {
  const { t } = useTranslation("lobbying")
  const segments = multiple ? SEGMENTS : SEGMENTS.filter(s => s !== "multiple")
  return (
    <ul style={legendStyle}>
      {segments.map(s => (
        <li key={s} style={legendItemStyle}>
          <LegendSwatch background={POSITION_COLORS[s]} />
          {t(`position.${s}`)}
        </li>
      ))}
      {note && <li style={{ color: MAPLE_COLORS.graySubtleText }}>{note}</li>}
    </ul>
  )
}

/** A legend entry's color square. */
export function LegendSwatch({ background }: { background: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: 10, height: 10, borderRadius: 2, background }}
    />
  )
}

export const legendStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.25rem 1.25rem",
  listStyle: "none",
  margin: 0,
  padding: 0,
  fontSize: 13,
  color: MAPLE_COLORS.textBody
}

export const legendItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6
}
