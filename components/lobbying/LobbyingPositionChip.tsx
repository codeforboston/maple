import React from "react"
import { useTranslation } from "next-i18next"
import type { Position } from "./activity"
import { POSITION_TONES } from "./chartTheme"

interface LobbyingPositionChipProps {
  // Normalized with normalizePosition.
  position: Position
  className?: string
  title?: string
}

export const LobbyingPositionChip: React.FC<LobbyingPositionChipProps> = ({
  position,
  className,
  title
}) => {
  const { t } = useTranslation("lobbying")

  return (
    <span
      className={className}
      title={title}
      style={{
        ...chipBaseStyle,
        ...POSITION_TONES[position].chip
      }}
    >
      {t(`position.${position}`)}
    </span>
  )
}

const chipBaseStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "0.15rem 0.55rem",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap"
}
