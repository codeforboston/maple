// Stage palette for the Learn section.
//
// The Figma prototype hardcoded NAVY #1A3185, GREEN #3D9922, ORANGE #FF8600 and
// CRIMSON #C71E32. Those are byte-identical to $blue/$green/$orange/$red in
// styles/bootstrap.scss, so we reference the emitted custom properties instead
// of repeating the hexes.

export const NAVY = "var(--bs-blue)"
export const GREEN = "var(--bs-green)"
export const ORANGE = "var(--bs-orange)"
export const CRIMSON = "var(--bs-red)"

/**
 * Opaque tints used for a completed rail node's fill. These are design values
 * from the prototype, not a computed percentage of the base color, so they are
 * kept as literals rather than derived with color-mix.
 */
export const TINT: Record<string, string> = {
  [NAVY]: "#e1e4ef",
  [GREEN]: "#e5f1e2",
  [ORANGE]: "#ffefdd",
  [CRIMSON]: "#f8e1e4"
}

/**
 * Translucent variant of a stage color.
 *
 * The prototype appended hex alpha to a hex string (`color + "40"`). That does
 * not work on a `var(--bs-blue)` reference, so the same ratios are expressed as
 * percentages through color-mix.
 *
 * 0x40 -> 25%, 0x28 -> 16%, 0x18 -> 9%, 0x12 -> 7%
 */
export const alpha = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`

/** Ordered stage colors, cycling navy -> green -> orange -> crimson. */
export const STAGE_COLORS = [NAVY, GREEN, ORANGE, CRIMSON, NAVY, GREEN]
