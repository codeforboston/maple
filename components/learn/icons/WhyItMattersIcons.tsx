import svgPaths from "./svgPaths"

// The three "Why it Matters" icons on /learn/testimony, taken verbatim from the
// Figma prototype. Decorative: each is paired with a visible heading.
//
// These use a parchment/navy/ochre palette of their own rather than the brand
// colors, so the hexes stay literal.

const size = { width: 40, height: 40 }
const a11y = { "aria-hidden": true, focusable: "false" } as const

export const IconAgenda = () => (
  <svg {...size} {...a11y} fill="none" viewBox="0 0 40 40">
    <path
      d={svgPaths.p3d8d7100}
      fill="#EAE4D8"
      stroke="#1B3A5C"
      strokeWidth="1.5"
    />
    <path
      d="M12 16H28M12 21H22"
      stroke="#1B3A5C"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
    <path d={svgPaths.pe310000} fill="#C8873A" />
    <path
      d="M27.5 28L29.5 30L33 26.5"
      stroke="#FDFAF5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
)

export const IconInsight = () => (
  <svg {...size} {...a11y} fill="none" viewBox="0 0 40 40">
    <path
      d={svgPaths.pad44800}
      fill="#EAE4D8"
      stroke="#1B3A5C"
      strokeWidth="1.5"
    />
    <path
      d="M20 13V20L24 24"
      stroke="#1B3A5C"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
    <path d={svgPaths.p5075f20} fill="#C8873A" />
  </svg>
)

export const IconChanges = () => (
  <svg {...size} {...a11y} fill="none" viewBox="0 0 40 40">
    <path
      d={svgPaths.p3a03a000}
      fill="#EAE4D8"
      stroke="#1B3A5C"
      strokeWidth="1.5"
    />
    <path d={svgPaths.p33cd4800} fill="#1B3A5C" opacity="0.3" />
    <path
      d="M16 22H24V32H16V22Z"
      stroke="#1B3A5C"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
)

export const WHY_ICONS = [IconAgenda, IconInsight, IconChanges]
