import React from "react"
import { useTranslation } from "next-i18next"
import { courtShortLabel } from "./sessions"

export type SessionFilter = "all" | number

/** Single legislative-session (General Court) picker for the lobbying pages.
 * Give it an `id` when a visible <label> names it. */
export const SessionSelect: React.FC<{
  sessions: number[]
  value: SessionFilter
  onChange: (value: SessionFilter) => void
  // The session in progress, marked "· current".
  current?: number
  allLabel?: string
  id?: string
  style?: React.CSSProperties
}> = ({ sessions, value, onChange, current, allLabel, id, style }) => {
  const { t } = useTranslation("lobbying")
  return (
    <select
      id={id}
      value={value}
      onChange={e =>
        onChange(e.target.value === "all" ? "all" : Number(e.target.value))
      }
      style={style}
      aria-label={id ? undefined : t("filters.session")}
    >
      {sessions.map(court => (
        <option key={court} value={court}>
          {court === current
            ? t("filters.currentSession", { label: courtShortLabel(court) })
            : courtShortLabel(court)}
        </option>
      ))}
      <option value="all">{allLabel ?? t("filters.allSessions")}</option>
    </select>
  )
}
