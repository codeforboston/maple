/** The share an input card is drawn at: 1, or less for a cosign row under
 * its card (Entry's `small`), set as `--entry-scale` on the card. */
export const SMALL_SCALE = 0.85

/** A length in the input card (Entry.tsx), scaled with it: the cosign rows
 * are the card made smaller, every length with it, and nothing else. */
export const sc = (px: number) => `calc(${px}px * var(--entry-scale, 1))`
