import React from "react"
import { useTranslation } from "next-i18next"
import { MAPLE_COLORS } from "./chartTheme"

const SOS_URL = "https://www.sec.state.ma.us/LobbyistPublicSearch/Default.aspx"

export const LobbyingAttribution: React.FC<{ className?: string }> = ({
  className
}) => {
  const { t } = useTranslation("lobbying")
  return (
    <p style={style} className={className}>
      <a href={SOS_URL} target="_blank" rel="noreferrer" style={linkStyle}>
        {t("attribution")}
      </a>
    </p>
  )
}

const style: React.CSSProperties = {
  fontSize: 12,
  color: MAPLE_COLORS.textMuted,
  marginTop: "1rem"
}

const linkStyle: React.CSSProperties = {
  color: MAPLE_COLORS.textMuted,
  textDecoration: "underline"
}
