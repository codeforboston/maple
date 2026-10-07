import React from "react"
import { useTranslation } from "next-i18next"
import { courtYears } from "./sessions"

export type SessionFilter = "all" | number

/** Single legislative-session (General Court) picker for the lobbying lists. */
export const SessionSelect: React.FC<{
  sessions: number[]
  value: SessionFilter
  onChange: (value: SessionFilter) => void
  style?: React.CSSProperties
}> = ({ sessions, value, onChange, style }) => {
  const { t } = useTranslation("lobbying")
  return (
    <select
      value={value}
      onChange={e =>
        onChange(e.target.value === "all" ? "all" : Number(e.target.value))
      }
      style={style}
      aria-label={t("filters.session")}
    >
      <option value="all">{t("filters.allSessions")}</option>
      {sessions.map(court => (
        <option key={court} value={court}>
          {t("filters.sessionOption", { court, years: courtYears(court) })}
        </option>
      ))}
    </select>
  )
}
