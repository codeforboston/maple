import React from "react"
import { useTranslation } from "next-i18next"
import { POSITION_COLORS } from "./chartTheme"

type Position = "support" | "oppose" | "neutral" | "none"

const CHIP_STYLES: Record<Position, React.CSSProperties> = {
  support: {
    background: "#e8f6ea",
    color: "#1d5d2d",
    border: "1px solid #3d9922"
  },
  oppose: {
    background: "#fde8ef",
    color: "#902141",
    border: "1px solid #c71e32"
  },
  neutral: {
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #cbd5e1"
  },
  none: {
    background: "#f1f5f9",
    color: "#64748b",
    border: "1px solid #d7e0ea"
  }
}

function normalizePosition(raw: string): Position {
  const lower = raw.toLowerCase()
  if (lower.includes("support")) return "support"
  if (lower.includes("oppose") || lower.includes("against")) return "oppose"
  if (lower.includes("neutral")) return "neutral"
  return "none"
}

interface LobbyingPositionChipProps {
  position: string
  className?: string
}

export const LobbyingPositionChip: React.FC<LobbyingPositionChipProps> = ({
  position,
  className
}) => {
  const { t } = useTranslation("lobbying")
  const key = normalizePosition(position)

  return (
    <span
      className={className}
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

export { normalizePosition }
export type { Position }
