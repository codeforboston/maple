import { Trans, useTranslation } from "next-i18next"
import styled from "styled-components"
import { Testimony } from "../db"
import { formatBillId } from "../formatting"
import * as links from "../links"
import { trimContent, VoteHand } from "./TestimonyCallout"

/** Each position's colours: the fill, for the bubble and its tail, and the
 * ink for its text. The site's green, blue and orange (--bs-green #3d9922,
 * --bs-blue #1a3185, --bs-orange #ff8600, orange being the colour testimony
 * uses for oppose elsewhere) as they look at 90% over white, written solid,
 * with white text. */
const COLORS: Record<Testimony["position"], { fill: string; ink: string }> = {
  endorse: { fill: "#50a338", ink: "white" },
  neutral: { fill: "#314691", ink: "white" },
  oppose: { fill: "#ff9219", ink: "white" }
}

/**
 * A recent testimony on the homepage as a speech bubble: the hand drawing
 * turned for the position, then the quote and its author and bill, on a
 * rounded ground in the position's colour, with a tail that drips down from
 * the bottom edge near the left. The tail is drawn with curved sides and
 * joined flush to the bubble in the same colour, so the two read as one
 * shape. The whole bubble links to the bill, as the callouts before it did.
 */
const Card = styled(links.Internal)`
  display: flex;
  flex-direction: column;
  height: 100%;
  /* Room below the bubble for the tail. */
  padding-bottom: 1rem;
  text-decoration: none;

  /* The hand on the left, then the quote and byline, in Lexend. At least
     the height a full three-line quote and its byline take, so a short quote
     makes the same size bubble as a long one, its text centred down it. */
  .bubble {
    position: relative;
    flex: 1;
    min-height: 9rem;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    border-radius: 0.75rem;
    color: white;
    font-family: var(--maple-font-heading);
    padding: 1.25rem 1.5rem;
  }

  /* The hand drawing (white line art in its own circle), at the width it
     had in the callouts' hand column. */
  .hand {
    flex: 0 0 auto;
    width: 4rem;
  }

  .text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  /* The ground and tail, behind the text and circle. */
  .shape {
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  .shape-fill {
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  .hand,
  .text {
    position: relative;
  }

  /* 1px up into the bubble, so no hairline shows at the join. */
  .tail {
    position: absolute;
    top: calc(100% - 1px);
    left: 1.75rem;
    width: 22px;
    height: 17px;
  }

  /* The author and the bill under the quote, smaller, in Nunito under the
     Lexend quote; the bill number keeps Lexend (.bill). */
  .byline {
    display: block;
    font-family: var(--maple-font-body);
    font-size: 0.9rem;
    font-weight: 500;
    margin-top: 0.75rem;
  }

  /* Bill numbers are in Lexend everywhere else on the site. A little heavier
     and underlined here, as the bill is what the bubble links to. */
  .bill {
    font-family: var(--maple-font-heading);
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }

  /* The quote, up to three lines. */
  .quote {
    display: -webkit-box;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    margin: 0;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  &:hover .bubble,
  &:focus-visible .bubble {
    color: white;
  }

  &:focus-visible {
    outline: none;
  }

  &:focus-visible .bubble {
    box-shadow: 0 0 0 0.25rem var(--maple-focus-ring);
  }
`

export default function TestimonyBubble({
  billId,
  court,
  position,
  content,
  authorDisplayName
}: Testimony) {
  const { t } = useTranslation("testimony")
  const { fill, ink } = COLORS[position]

  return (
    <Card href={links.maple.bill({ id: billId, court })}>
      <span className="bubble" style={{ color: ink }}>
        {/* The bubble's ground and its tail (.shape), with the text and the
            circle above them. */}
        <span className="shape">
          <span className="shape-fill" style={{ background: fill }} />
          <svg
            className="tail"
            viewBox="0 0 22 17"
            aria-hidden="true"
            style={{ color: fill }}
          >
            <path
              fill="currentColor"
              d="M0 0H22C16 0 10.5 5 7 14.5C6.2 16.6 4.6 16.6 4.4 14.5C4 9 2.6 3 0 0Z"
            />
          </svg>
        </span>
        {/* The hand drawing the callouts had before (VoteHand.png), turned
            for each position. */}
        <span className={`hand hand-${position}`}>
          <VoteHand position={position} />
        </span>
        <span className="text">
          <span className="quote">“{trimContent(content, 220)}”</span>
          <span className="byline">
            <Trans
              t={t}
              i18nKey="testimonyCallout.byline"
              values={{ author: authorDisplayName, bill: formatBillId(billId) }}
              components={{ 1: <span className="bill" /> }}
            />
          </span>
        </span>
      </span>
    </Card>
  )
}
