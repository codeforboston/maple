import React from "react"
import { useTranslation } from "next-i18next"
import type { PositionFilter } from "./activity"
import { selectStyle } from "./LobbyingPanel"

/** Filters an activity table by its rows' most recent position. Give it an
 * `id` for the visible <label> naming it. */
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
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value as PositionFilter)}
      style={selectStyle}
    >
      <option value="all">{allLabel}</option>
      <option value="support">{t("position.support")}</option>
      <option value="oppose">{t("position.oppose")}</option>
      <option value="neutral">{t("position.neutral")}</option>
    </select>
  )
}
