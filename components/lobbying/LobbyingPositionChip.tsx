import React from "react"
import { useTranslation } from "next-i18next"
import { normalizePosition, type Position } from "./activity"

const CHIP_STYLES: Record<Position, React.CSSProperties> = {
  support: {
    background: "#e8f6ea",
    color: "#1d5d2d",
    border: "1px solid #c8e7cf"
  },
  oppose: {
    background: "#fff4e8",
    color: "#7a3800",
    border: "1px solid #ff8600"
  },
  neutral: {
    background: "#e8efff",
    color: "#1d3f8a",
    border: "1px solid #c9d8ff"
  },
  none: {
    background: "#f1f5f9",
    color: "#64748b",
    border: "1px solid #d7e0ea"
  }
}

interface LobbyingPositionChipProps {
  position: string
  className?: string
  title?: string
}

export const LobbyingPositionChip: React.FC<LobbyingPositionChipProps> = ({
  position,
  className,
  title
}) => {
  const { t } = useTranslation("lobbying")
  const key = normalizePosition(position)

  return (
    <span
      className={className}
      title={title}
      style={{
        ...chipBaseStyle,
        ...CHIP_STYLES[key]
      }}
    >
      {t(`position.${key}`)}
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
