import React from "react"
import { MAPLE_COLORS } from "./chartTheme"
import styles from "./lobbying.module.css"

export type SortDir = "asc" | "desc"

export const thStyle: React.CSSProperties = {
  padding: "0.4rem 0.75rem",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: MAPLE_COLORS.textMuted,
  whiteSpace: "nowrap"
}

/** A sortable column header. Every sortable column shows an arrow (↕ until
 * it's the sorted one), so headers keep their width when the sort changes. */
export function SortTh<K extends string>({
  label,
  sortKey,
  current,
  dir,
  onSort,
  style,
  className
}: {
  label: string
  sortKey: K
  current: K
  dir: SortDir
  onSort: (k: K) => void
  style?: React.CSSProperties
  className?: string
}) {
  const active = sortKey === current
  return (
    <th
      aria-sort={
        active ? (dir === "asc" ? "ascending" : "descending") : undefined
      }
      className={className}
      style={{
        ...thStyle,
        ...style,
        color: active ? MAPLE_COLORS.primary : MAPLE_COLORS.textMuted
      }}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={styles.sortButton}
      >
        {label}
        <span
          aria-hidden="true"
          style={{ fontSize: 10, marginLeft: 3, opacity: active ? 1 : 0.4 }}
        >
          {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  )
}
