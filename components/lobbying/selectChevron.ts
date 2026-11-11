import type { CSSProperties } from "react"
import { MAPLE_COLORS } from "./chartTheme"

const chevron = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="none" stroke="${MAPLE_COLORS.textMuted}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m2 5 6 6 6-6"/></svg>`
)

/** Part of the lobbying selects' style (selectStyle, LobbyingPanel). Each
 * browser draws its own arrow tight against the right edge; this puts one
 * chevron, in muted ink, set in from the edge, with room for it. The image
 * only, as longhands, so each select keeps its own background colour (white,
 * or the session select's blue). */
export const selectChevron: CSSProperties = {
  appearance: "none",
  WebkitAppearance: "none",
  paddingRight: "2rem",
  backgroundImage: `url("data:image/svg+xml,${chevron}")`,
  backgroundPosition: "right 0.65rem center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "12px 9px"
}
