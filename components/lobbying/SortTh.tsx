import {
  faArrowDown,
  faArrowUp,
  faSort
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "next-i18next"
import React from "react"
import { MAPLE_COLORS } from "./chartTheme"
import styles from "./lobbying.module.css"

export type SortDir = "asc" | "desc"

/* As the site's eyebrow (.maple-eyebrow, as the conference pages' Eyebrow
   sets it), at 12px and bold (700 for its 600). */
export const thStyle: React.CSSProperties = {
  // Nunito, set outright rather than inherited.
  fontFamily: "var(--maple-font-body)",
  // Room for a second line, a note like "Hover for counts", so header rows
  // are one height with or without one: half above the header and half
  // below, so it sits in the middle. In a table where a header has its note,
  // the headers sit at the top instead (thTopPadding, thWithNoteStyle).
  paddingTop: "calc(0.4rem + 0.75em)",
  paddingRight: "0.75rem",
  paddingBottom: "calc(0.4rem + 0.75em)",
  paddingLeft: "0.75rem",
  lineHeight: 1.5,
  // Every header on its first line, where one runs to two.
  verticalAlign: "top",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: MAPLE_COLORS.textMuted,
  whiteSpace: "nowrap"
}

/** In a table where a header has a note: the room under the header, so it
 * lines up with the note's header's first line. For SortTh's style. */
export const thTopPadding: React.CSSProperties = {
  paddingTop: "0.4rem",
  paddingBottom: "calc(0.4rem + 1.5em)"
}

/** thStyle with thTopPadding, for a plain header in such a table. */
export const thTopStyle: React.CSSProperties = { ...thStyle, ...thTopPadding }

const noteRowPadding: React.CSSProperties = {
  paddingTop: "0.4rem",
  paddingBottom: "0.4rem"
}

/** A header with a note on its second line, in the room thStyle keeps. */
export const thWithNoteStyle: React.CSSProperties = {
  ...thStyle,
  ...noteRowPadding
}

/** A header's note, on the line under it: "Hover for counts", or the sorted
 * column's order. A step lighter than the header, in the headers' grey, and
 * not uppercase. */
export const thNoteStyle: React.CSSProperties = {
  display: "block",
  color: MAPLE_COLORS.textMuted,
  fontSize: 12,
  fontWeight: 400,
  // The header's letter spacing before it took the eyebrow's.
  letterSpacing: "0.05em",
  textTransform: "none"
}

/** A sortable column header. The sorted column shows an arrow for its order,
 * and under it, as a note (thNoteStyle), the order in words; the others both
 * carets, stacked, as the navbar's menus draw one, so headers keep their
 * width when the sort changes. A table with sorting always has a sorted
 * column, so its headers sit at the top, as a table with a note's do. */
export function SortTh<K extends string>({
  label,
  sortKey,
  current,
  dir,
  onSort,
  byName = false,
  style,
  className
}: {
  label: string
  sortKey: K
  current: K
  dir: SortDir
  onSort: (k: K) => void
  /** Sorts names, so its note reads "A to Z" rather than "Lowest first". */
  byName?: boolean
  style?: React.CSSProperties
  className?: string
}) {
  const { t } = useTranslation("lobbying")
  const active = sortKey === current
  const order = byName
    ? dir === "asc"
      ? "sort.az"
      : "sort.za"
    : dir === "asc"
    ? "sort.lowFirst"
    : "sort.highFirst"
  return (
    <th
      aria-sort={
        active ? (dir === "asc" ? "ascending" : "descending") : undefined
      }
      className={className}
      style={{
        ...thStyle,
        ...style,
        // The sorted header's note fills the room the others keep below.
        ...(active ? noteRowPadding : thTopPadding),
        // The sorted column in the brand blue, at the heaviest weight.
        ...(active && { color: MAPLE_COLORS.primary, fontWeight: 900 })
      }}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={styles.sortButton}
      >
        {label}
        <FontAwesomeIcon
          icon={active ? (dir === "asc" ? faArrowUp : faArrowDown) : faSort}
          aria-hidden
          style={active ? sortedArrowStyle : unsortedIconStyle}
        />
      </button>
      {/* aria-sort says it for screen readers. */}
      {active && (
        <span style={thNoteStyle} aria-hidden="true">
          {t(order)}
        </span>
      )}
    </th>
  )
}

const unsortedIconStyle = {
  fontSize: 12,
  marginLeft: 4,
  opacity: 0.4
} satisfies React.CSSProperties

/** The sorted column's arrow, thickened to sit with its bold label: an
 * outline in its own colour, in the icon's units (its 512 tall, at 12px). */
const sortedArrowStyle = {
  fontSize: 12,
  marginLeft: 4,
  color: MAPLE_COLORS.primary,
  stroke: "currentColor",
  strokeWidth: 40,
  strokeLinejoin: "round"
} satisfies React.CSSProperties
