import React from "react"
import { useTranslation } from "next-i18next"
import styles from "./lobbying.module.css"
import type { PositionFilter } from "./activity"
import { selectStyle } from "./LobbyingPanel"

/** Filters an activity table by its rows' most recent position, its label
 * floating inside it, as the site's form selects' (Bootstrap's
 * form-floating, as on the organization sign-up). */
export function PositionSelect({
  id,
  value,
  onChange,
  allLabel
}: {
  id: string
  value: PositionFilter
  onChange: (value: PositionFilter) => void
  allLabel: string
}) {
  const { t } = useTranslation("lobbying")
  return (
    <div
      className={`form-floating ${styles.floatingField}`}
      // The page's 16px, as the sign-up form's, not the filter bar's 14px,
      // which the floating label would take.
      style={{ fontSize: "1rem" }}
    >
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value as PositionFilter)}
        className="form-select"
        style={selectStyle}
      >
        <option value="all">{allLabel}</option>
        <option value="support">{t("position.support")}</option>
        <option value="oppose">{t("position.oppose")}</option>
        <option value="neutral">{t("position.neutral")}</option>
      </select>
      <label htmlFor={id}>{t("filters.position")}</label>
    </div>
  )
}
