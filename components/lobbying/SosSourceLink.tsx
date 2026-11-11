import React from "react"
import { useTranslation } from "next-i18next"
import { MAPLE_COLORS } from "./chartTheme"

/** Link to the original page on the MA Secretary of State's lobbyist site. */
export const SosSourceLink: React.FC<{
  href?: string | null
  label?: string
  style?: React.CSSProperties
}> = ({ href, label, style }) => {
  const { t } = useTranslation("lobbying")
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={t("misc.viewOnSosLabel")}
      aria-label={t("misc.viewOnSosLabel")}
      style={{ color: MAPLE_COLORS.primary, whiteSpace: "nowrap", ...style }}
    >
      {label ?? t("misc.viewOnSos")}
    </a>
  )
}
