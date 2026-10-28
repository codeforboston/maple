import React from "react"
import { useTranslation } from "next-i18next"
import { MAPLE_COLORS } from "./chartTheme"

type Position = "support" | "oppose" | "neutral" | "none"

/** Each position a pale fill, dark ink and a pale outline in the same hue. */
const CHIP_STYLES: Record<Position, React.CSSProperties> = {
  support: {
    background: MAPLE_COLORS.greenSubtleBg,
    color: MAPLE_COLORS.greenSubtleText,
    border: `1px solid ${MAPLE_COLORS.greenBorder}`
  },
  oppose: {
    background: MAPLE_COLORS.orangeSubtleBg,
    color: MAPLE_COLORS.orangeSubtleText,
    border: `1px solid ${MAPLE_COLORS.orangeBorder}`
  },
  neutral: {
    background: MAPLE_COLORS.blueSubtleBg,
    color: MAPLE_COLORS.blueSubtleText,
    border: `1px solid ${MAPLE_COLORS.blueBorder}`
  },
  none: {
    background: MAPLE_COLORS.graySubtleBg,
    color: MAPLE_COLORS.textMuted,
    border: `1px solid ${MAPLE_COLORS.graySubtleBorder}`
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
  /** The words exactly as the filing reports them (a dash when there are
   * none) rather than the translated label; the colours still follow the
   * position.
   * The bill page uses it, as it showed the reported words before it used
   * this chip. */
  showReported?: boolean
}

export const LobbyingPositionChip: React.FC<LobbyingPositionChipProps> = ({
  position,
  className,
  showReported = false
}) => {
  const { t } = useTranslation("lobbying")
  const key = normalizePosition(position)
  const label = showReported ? position || "—" : t(`position.${key}`)

  return (
    <span
      className={className}
      style={{
        ...chipBaseStyle,
        ...CHIP_STYLES[key]
      }}
    >
      {label}
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
