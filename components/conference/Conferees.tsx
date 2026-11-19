import { useEffect, useRef, useState } from "react"
import { useTranslation } from "next-i18next"
import styled, { keyframes } from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { shortName } from "../formatting"
import type { Branch } from "../../functions/src/common"
import { ChevronRight } from "./input/icons"
import { wash } from "./input/tokens"
import { Eyebrow, partyColor } from "./styles"
import { ConfereeView, personKey } from "./types"

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`

/** One person, the whole row one link out to their profile on
 * malegislature.gov, in a new tab. Pointed at, it rings their portrait
 * (Conferees), takes a slightly darker ground and shows the way out at its
 * right (Go). The ground is a pill reaching 4px past what is in the row,
 * which keeps its place; its round left end sits around the portrait. */
const Row = styled.a<{ $back: boolean }>`
  display: flex;
  align-items: center;
  margin: -4px;
  padding: 4px;
  border-radius: 9999px;
  color: inherit;
  text-decoration: none;
  opacity: ${({ $back }) => ($back ? 0.45 : 1)};
  transition: opacity 120ms ease, background-color 120ms ease;
  &:hover {
    color: inherit;
    background: ${wash.default};
  }
  &:focus-visible {
    outline: 2px solid var(--maple-focus-ring);
    outline-offset: 2px;
    background: ${wash.default};
  }
`

/** The name and the line under it, 10px from the portrait, taking the row's
 * width up to the chevron's slot (Go), and giving it up as the row narrows. */
const Text = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  margin-left: 0.625rem;
`

/** The way out, a chevron centred in a slot at the row's right edge, shown
 * while the row is pointed at; the slot is there all the same, so nothing
 * moves. */
const Go = styled.span`
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  color: var(--maple-text-muted);
  visibility: hidden;

  ${Row}:hover & {
    visibility: visible;
  }
  ${Row}:focus-visible & {
    visibility: visible;
  }
`

/** The empty circle's ground while a photo loads: a light grey, with a band
 * of a deeper grey running down it on the diagonal, from the top left to the
 * bottom right, again and again. Only the colours inside the circle change; the
 * circle doesn't move. The gradient is three times the circle's size, and
 * its window moves from the end of it to the start, so the band travels
 * forward. */
const skeleton = keyframes`
  from {
    background-position: 100% 100%;
  }
  to {
    background-position: 0% 0%;
  }
`

/** How long a photo takes to fade in over the skeleton, in ms (Portrait's
 * img transition). */
const FADE_MS = 200

/** The party's ring around a portrait `size` across: 2.5px under 32px, 3px,
 * and 4px from 48px (the explorer panel's card). */
const partyRing = (size: number) => (size < 32 ? 2.5 : size >= 48 ? 4 : 3)

/** The white gap in the selection ring (Portrait's `$lit`), between the
 * party's ring and the dark line: 2px under 32px, 2.5px, and 3px from 48px. */
const selectionGap = (size: number) => (size < 32 ? 2 : size >= 48 ? 3 : 2.5)

/** 36px unless `$size` says otherwise; a parent can resize it through
 * `--portrait-size`. */
const Portrait = styled.span<{
  $ring: string
  $lit: boolean
  $size?: number
}>`
  position: relative;
  flex: 0 0 auto;
  display: block;
  width: var(--portrait-size, ${({ $size = 36 }) => $size}px);
  height: var(--portrait-size, ${({ $size = 36 }) => $size}px);

  img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    background: var(--maple-surface-page);
    border: ${({ $size = 36 }) => partyRing($size)}px solid
      ${({ $ring }) => $ring};
    /* Lit, the selection ring: a white gap (selectionGap), then a 2px dark
       line. */
    box-shadow: ${({ $lit, $size = 36 }) => {
      if (!$lit) return "none"
      const gap = selectionGap($size)
      return `0 0 0 ${gap}px var(--maple-surface-base), 0 0 0 ${
        gap + 2
      }px var(--maple-text-strong)`
    }};
    transition: box-shadow 120ms ease, opacity ${FADE_MS}ms ease;
  }
  /* The skeleton (ConfereeFace): while the photo loads, and on under it
     while it fades in, so nothing flashes between the two; the photo and its
     ring fade in together over it. Edged in a still grey as thick as the
     party's ring, drawn inside the edge as a shadow rather than a border, so
     the photo keeps its full size underneath and fades in without a jump. */
  &[data-skeleton] {
    border-radius: 50%;
    box-shadow: inset 0 0 0 ${({ $size = 36 }) => partyRing($size)}px #dcdee2;
    background-image: linear-gradient(
      135deg,
      #eceef1 30%,
      #dfe1e5 50%,
      #eceef1 70%
    );
    background-size: 300% 300%;
    animation: ${skeleton} 3.5s ease-in-out infinite;
  }
  &[data-loading] img {
    opacity: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    &[data-skeleton] {
      animation: none;
    }
    img {
      transition: box-shadow 120ms ease;
    }
  }
`

const Star = styled.span`
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--maple-surface-base);
  color: #ecb72e;
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Name = styled.span`
  display: block;
  line-height: 1.3;
  white-space: nowrap;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--maple-text-strong);
`

export const Chair = styled.span`
  margin-left: 0.375rem;
  font-size: 0.75rem;
  font-weight: 400;
  color: #8a5a00;
`

const Sub = styled.span`
  display: block;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--maple-text-muted);
`

/** The reader's word for one of their own legislators. */
export const yoursKey = (c: ConfereeView) =>
  c.branch === "House" ? "your_representative" : "your_senator"

/** A member's face ringed in their party's colour. `lit` adds the outer ring
 * that marks the one being read, `own` the star for the reader's own
 * legislator. Where no name stands beside it, `labelled` names the face. */
export function ConfereeFace({
  c,
  size,
  lit = false,
  own = false,
  labelled = false
}: {
  c: ConfereeView
  size?: number
  lit?: boolean
  own?: boolean
  labelled?: boolean
}) {
  const { t } = useTranslation("conferences")
  // Loading until the photo is in or has failed, then fading in over the
  // skeleton, which stays under it until the fade is over (FADE_MS). A photo
  // already in by the time the page is live (from the cache) shows at once.
  const [stage, setStage] = useState<"loading" | "fading" | "done">("loading")
  const img = useRef<HTMLImageElement>(null)
  const fadeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    if (img.current?.complete) setStage("done")
    return () => clearTimeout(fadeTimer.current)
  }, [])
  const arrived = () => {
    setStage("fading")
    fadeTimer.current = setTimeout(() => setStage("done"), FADE_MS + 50)
  }
  return (
    <Portrait
      $ring={partyColor(c.party)}
      $lit={lit}
      $size={size}
      data-skeleton={stage !== "done" ? "" : undefined}
      data-loading={stage === "loading" ? "" : undefined}
    >
      <img
        ref={img}
        src={`https://malegislature.gov/Legislators/Profile/170/${c.memberCode}.jpg`}
        alt={labelled ? c.name : ""}
        title={labelled ? c.name : undefined}
        loading="lazy"
        onLoad={arrived}
        onError={arrived}
      />
      {own && (
        <Star aria-label={t(yoursKey(c))}>
          <FontAwesomeIcon icon={faStar} />
        </Star>
      )}
    </Portrait>
  )
}

/**
 * One chamber's three, to stand beside that chamber's map. Nothing here is
 * picked: pointing at a person rings their portrait, lights their district
 * and sets the others back, so the list can answer the map as well as the
 * other way round, and clicking them opens their profile on
 * malegislature.gov.
 */
export function Conferees({
  chamber,
  conferees,
  mine,
  selected,
  onHover
}: {
  chamber: Branch
  conferees: ConfereeView[]
  /** Member codes of the viewer's own legislators. */
  mine: Set<string>
  /** The one being read, pointed at here or on the map. */
  selected: string | null
  onHover: (key: string | null) => void
}) {
  const { t } = useTranslation("conferences")
  return (
    <div>
      <Eyebrow className="mb-2">{t(chamber.toLowerCase())}</Eyebrow>
      <List>
        {conferees
          .filter(c => c.branch === chamber)
          .map(c => {
            // A conferee the map has no seat for still answers the pointer,
            // under their own code; they just light nothing.
            const key = personKey(c)
            const own = mine.has(c.memberCode)
            const lit = selected === key
            return (
              <li key={c.memberCode}>
                <Row
                  // Their profile on malegislature.gov, whether or not
                  // MAPLE's own legislator pages are on.
                  href={`https://malegislature.gov/Legislators/Profile/${c.memberCode}`}
                  target="_blank"
                  rel="noreferrer"
                  $back={Boolean(selected) && !lit}
                  onPointerEnter={() => onHover(key)}
                  onPointerLeave={() => onHover(null)}
                  onFocus={() => onHover(key)}
                  onBlur={() => onHover(null)}
                >
                  <ConfereeFace c={c} lit={lit} own={own} />
                  <Text>
                    <Name>
                      {shortName(c.name)}
                      {c.chair && <Chair>{t("chair")}</Chair>}
                    </Name>
                    <Sub>{own ? t(yoursKey(c)) : c.district}</Sub>
                  </Text>
                  <Go aria-hidden>
                    <ChevronRight size={16} />
                  </Go>
                </Row>
              </li>
            )
          })}
      </List>
    </div>
  )
}
