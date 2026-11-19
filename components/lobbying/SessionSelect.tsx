import React from "react"
import { useTranslation } from "next-i18next"
import styles from "./lobbying.module.css"
import { courtShortLabel } from "./sessions"

export type SessionFilter = "all" | number

/** Single legislative-session (General Court) picker for the lobbying pages.
 * Its label floats inside it, as the site's form selects' (Bootstrap's
 * form-floating, as on the organization sign-up). */
export const SessionSelect: React.FC<{
  sessions: number[]
  value: SessionFilter
  onChange: (value: SessionFilter) => void
  // The session in progress, marked "· current".
  current?: number
  allLabel?: string
  id: string
  style?: React.CSSProperties
  // Fill the column it sits in, rather than fit its longest session.
  fill?: boolean
}> = ({ sessions, value, onChange, current, allLabel, id, style, fill }) => {
  const { t } = useTranslation("lobbying")
  return (
    <div
      className={`form-floating ${styles.floatingField}`}
      // The page's 16px, as the sign-up form's, not the filter bar's 14px,
      // which the floating label would take.
      style={{
        fontSize: "1rem",
        flex: fill ? 1 : undefined,
        // A little short of the column it fills.
        maxWidth: fill ? "23.5rem" : undefined
      }}
    >
      <select
        id={id}
        value={value}
        onChange={e =>
          onChange(e.target.value === "all" ? "all" : Number(e.target.value))
        }
        className="form-select"
        style={style}
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
      <label htmlFor={id}>{t("filters.session")}</label>
    </div>
  )
}
