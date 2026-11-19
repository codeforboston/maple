// The mockup's icon set: one 16/20px grid, 1.8–2px round strokes, currentColor.
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true
}

export const PlusIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" strokeWidth={2} {...base}>
    <path d="M10 4v12M4 10h12" />
  </svg>
)

export const ChevronIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    strokeWidth={1.8}
    {...base}
  >
    <path d="M6 4l4 4-4 4" />
  </svg>
)

export const ArrowIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    strokeWidth={1.8}
    {...base}
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
)
