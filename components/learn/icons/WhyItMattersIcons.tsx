// The three "Why it Matters" icons on /learn/testimony.
// Decorative: each is paired with a visible heading.
//
// These use a parchment/navy/ochre palette of their own rather than the brand
// colors, so the hexes stay literal. Drawn to a common ~26px optical size inside
// the 40x40 box so the three read as one set.

const size = { width: 40, height: 40 }
const a11y = { "aria-hidden": true, focusable: "false" } as const

const PARCHMENT = "#EAE4D8"
const NAVY = "#1B3A5C"
const OCHRE = "#C8873A"

// The speaking head's mouth, and how far the outer speech strokes swing off it.
// The base stroke below is drawn at the mouth's y so the fan stays radial: move
// one and you must move the other.
const MOUTH = "25.5 20"
const SPEECH_FAN = 35

// How far the whole speaking head is nudged right, toward the axis the bulb and
// bullseye sit on. Capped by the fan, which would otherwise reach the box edge.
const VOICE_NUDGE = 1.5

/**
 * A speaking head, after the emoji: a profile facing right, with the sound
 * radiating from the mouth. Mirrored from the emoji's left-facing head so it
 * speaks toward the heading beside it rather than away from it.
 */
export const IconVoice = () => (
  <svg {...size} {...a11y} fill="none" viewBox="0 0 40 40">
    {/* The speech fan hangs off the right, which drags the bounding box with it
        and leaves the head sitting left of the axis the bulb and bullseye share.
        Nudge the whole icon right to close most of that gap -- head and fan move
        together, so the fan stays radial about the mouth. */}
    <g transform={`translate(${VOICE_NUDGE} 0)`}>
      {/* Profile silhouette, clockwise from the back of the skull: crown, brow,
          nose, the open mouth, then the jaw. Drawn in Figma -- the head's upward
          tilt is baked into these coordinates rather than applied as a rotation,
          so the face, the speech fan and the viewBox share one coordinate system. */}
      <path
        d="M9.51996 22.11C6.41996 16.28 7.94996 9.34997 12.72 6.81997C15.9 5.12997 19.06 6.38997 20.66 9.38997C21.5 10.98 21.35 11.97 21.82 12.85C22.38 13.91 25.51 13.83 26.17 15.07C26.78 16.22 25.33 17.33 24.19 18.16C23.5781 18.5919 21.8647 18.7741 21 19.5C20.1829 20.1858 20.5 21 21 21.5C21.9261 22.4261 23.0565 22.268 24 23C24.0565 24.268 23 25.5884 21.53 26.37C17.11 28.72 12.15 27.05 9.51996 22.11Z"
        fill={PARCHMENT}
        stroke={NAVY}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <circle cx="18.67" cy="15.66" r="1.1" fill={NAVY} />
      {/* Speech, as in the emoji: one stroke, drawn three times and rotated about
          the mouth. Widen or narrow the fan by changing SPEECH_FAN; lengthen it by
          moving the 35.5 in the path. */}
      {[-SPEECH_FAN, 0, SPEECH_FAN].map(angle => (
        <path
          key={angle}
          d="M30.5 20L35.5 20"
          transform={`rotate(${angle} ${MOUTH})`}
          stroke={OCHRE}
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      ))}
    </g>
  </svg>
)

/**
 * A lightbulb: you give legislators real-world insight. The drawing runs wider
 * than the shared box, so it is scaled about its own centre into it. The stroke
 * is divided by that scale, so it still renders at a true 1.5 like the others.
 */
const BULB_SCALE = 0.8448
const BULB_STROKE = 1.5 / BULB_SCALE

export const IconInsight = () => (
  <svg {...size} {...a11y} fill="none" viewBox="0 0 40 40">
    <g transform={`translate(3.103 2.85) scale(${BULB_SCALE})`}>
      <path
        d="M20 7C14.8 7 10.5 11.2 10.5 16.3C10.5 19.7 12.4 22.6 15.2 24.3V27C15.2 27.6 15.7 28 16.2 28H23.8C24.3 28 24.8 27.6 24.8 27V24.3C27.6 22.6 29.5 19.7 29.5 16.3C29.5 11.2 25.2 7 20 7Z"
        fill={PARCHMENT}
        stroke={NAVY}
        strokeLinejoin="round"
        strokeWidth={BULB_STROKE}
      />
      <path
        d="M16.5 31H23.5M18 34H22"
        stroke={NAVY}
        strokeLinecap="round"
        strokeWidth={BULB_STROKE}
      />
      <path
        d="M20 24V19M17.5 16.5L20 19L22.5 16.5"
        stroke={OCHRE}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={BULB_STROKE}
      />
      <path
        d="M5.5 16.3H7.5M32.5 16.3H34.5M9.2 6.6L10.6 8M30.8 6.6L29.4 8"
        stroke={OCHRE}
        strokeLinecap="round"
        strokeWidth={BULB_STROKE}
      />
    </g>
  </svg>
)

/**
 * A bullseye: you can recommend specific changes. Radii are scaled rather than
 * transformed, so the stroke stays a true 1.5. A solid disc carries more visual
 * weight than the outlined bulb and head, so it is drawn a little inside the
 * shared box rather than filling it.
 */
export const IconTarget = () => (
  <svg {...size} {...a11y} fill="none" viewBox="0 0 40 40">
    <circle
      cx="20"
      cy="20"
      r="10.7"
      fill={PARCHMENT}
      stroke={NAVY}
      strokeWidth="1.5"
    />
    <circle cx="20" cy="20" r="6.58" stroke={NAVY} strokeWidth="1.5" />
    <circle cx="20" cy="20" r="2.88" fill={OCHRE} />
  </svg>
)

export const WHY_ICONS = [IconVoice, IconInsight, IconTarget]
