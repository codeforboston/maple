import type { CSSProperties } from "react"
import { MAPLE_COLORS } from "./chartTheme"

const chevron = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="none" stroke="${MAPLE_COLORS.textMuted}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m2 5 6 6 6-6"/></svg>`
)

/** Spread over a lobbying filter select's own style, after it. Each browser
 * draws its own arrow tight against the right edge; this puts one chevron,
 * in the muted ink of the court picker's arrow, set in from the edge, with
 * room for it. One background shorthand, so it replaces the field's white
 * rather than mixing with it. */
export const selectChevron: CSSProperties = {
  appearance: "none",
  WebkitAppearance: "none",
  paddingRight: "2rem",
  background: `${MAPLE_COLORS.surfaceBase} url("data:image/svg+xml,${chevron}") no-repeat right 0.65rem center / 12px 9px`
}
