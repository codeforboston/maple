import { useTranslation } from "next-i18next"
import styled from "styled-components"
import type { Branch } from "../../functions/src/common"
import { shortName } from "../formatting"
import { ground, line, sunken } from "./input/tokens"
import { box, cells, outline, seatCount } from "./map/geometry"
import { Eyebrow, partyColor } from "./styles"
import { ConfereeView } from "./types"

/** Who a lit seat is, for the label and the colour. */
type SeatPerson = { name: string; party: string }

/** The seats to light for these conferees, by seat key. A conferee the map
 * has no cell for lights nothing. */
export const seatsOf = (conferees: ConfereeView[]) =>
  Object.fromEntries(
    conferees.flatMap((c): [string, SeatPerson][] =>
      c.seat ? [[c.seat, { name: shortName(c.name), party: c.party }]] : []
    )
  )

/** What every cell shares, so a polygon only carries what sets it apart. A
 * lit cell sets its colour inline: a stylesheet rule outranks an SVG
 * presentation attribute, so a `fill` attribute here would be painted over. */
const Svg = styled.svg`
  display: block;
  width: 100%;
  /* Room to grow with a wider page, but no more than 300px. */
  max-width: 300px;
  height: auto;

  /* The mockup's greys: empty seats in its sunken grey, every seat edged in
     its page grey. */
  polygon {
    fill: ${sunken};
    stroke: ${ground};
    stroke-width: 1.2;
    vector-effect: non-scaling-stroke;
    transition: fill-opacity 120ms ease;
  }
  polygon[role="button"] {
    cursor: pointer;
    outline: none;
  }
  polygon[role="button"]:focus-visible {
    stroke: var(--maple-text-strong);
    stroke-width: 2;
  }
`

/** The state's three pieces, as a fill or as a hairline. */
const Outline = (props: { fill: string; stroke?: string }) => (
  <>
    {outline.map((d, i) => (
      <path key={i} d={d} vectorEffect="non-scaling-stroke" {...props} />
    ))}
  </>
)

/**
 * One chamber, one cell per seat. The committee's seats are filled by party
 * and the rest of the chamber stays blank: three cells lit in a chamber of a
 * hundred and sixty says how few people are in the room better than a
 * sentence. While one seat is being read the other lit seats sit back and the
 * one being read takes a thick edge.
 */
export function DistrictMap({
  chamber,
  people,
  selected,
  onHover,
  onPin
}: {
  chamber: Branch
  /** Seat key to person, for every seat to light. */
  people: Record<string, SeatPerson>
  /** The seat being read, if any; a key from either chamber. */
  selected: string | null
  onHover: (key: string | null) => void
  onPin: (key: string) => void
}) {
  const { t } = useTranslation("conferences")
  const [x, y, w, h] = box
  const own = cells[chamber]
  const clipId = `ma-${chamber.toLowerCase()}-clip`
  const lit = Object.keys(people).filter(k => k in own)
  const reading = selected && selected in own ? people[selected] : null
  const chamberName = t(chamber.toLowerCase())

  return (
    <div>
      <Eyebrow className="mb-2">
        {t("seats_lit", {
          chamber: chamberName,
          count: lit.length,
          total: seatCount[chamber]
        })}
      </Eyebrow>
      <Svg
        viewBox={`${x} ${y} ${w} ${h}`}
        role="img"
        aria-label={t("map_label", { chamber: chamberName })}
      >
        <defs>
          <clipPath id={clipId}>
            <Outline fill="none" />
          </clipPath>
        </defs>
        {/* The coastline under the cells, so any sliver a cell does not
            reach still reads as land. */}
        <Outline fill={sunken} />
        <g clipPath={`url(#${clipId})`}>
          {Object.entries(own).map(([key, points]) => {
            const person = people[key]
            if (!person) return <polygon key={key} points={points} />
            return (
              <polygon
                key={key}
                points={points}
                style={{
                  fill: partyColor(person.party),
                  fillOpacity: selected && key !== selected ? 0.45 : 1
                }}
                role="button"
                tabIndex={0}
                aria-pressed={key === selected}
                aria-label={person.name}
                onPointerEnter={() => onHover(key)}
                onPointerLeave={() => onHover(null)}
                onFocus={() => onHover(key)}
                onBlur={() => onHover(null)}
                onClick={() => onPin(key)}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onPin(key)
                  }
                }}
              />
            )
          })}
          {/* The seat being read, outlined in its own colour and drawn last
              so no neighbour paints over the edge. A city seat is a speck;
              the edge is what makes it findable. */}
          {reading && selected && (
            <polygon
              points={own[selected]}
              style={{
                fill: "none",
                stroke: partyColor(reading.party),
                strokeWidth: 5,
                strokeLinejoin: "round",
                pointerEvents: "none"
              }}
            />
          )}
        </g>
        {/* The coastline again as a hairline, so the state has an edge of
            its own rather than ending wherever the cells happen to. */}
        <Outline fill="none" stroke={line.strong} />
      </Svg>
    </div>
  )
}
