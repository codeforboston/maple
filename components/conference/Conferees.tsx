import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { useFlags } from "../featureFlags"
import { shortName } from "../formatting"
import { Internal, maple } from "../links"
import type { Branch } from "../../functions/src/common"
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

const Row = styled.button<{ $back: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  cursor: pointer;
  opacity: ${({ $back }) => ($back ? 0.45 : 1)};
  transition: opacity 120ms ease;
`

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
    border: ${({ $size = 36 }) => ($size < 32 ? 2 : 3)}px solid
      ${({ $ring }) => $ring};
    box-shadow: ${({ $lit }) =>
      $lit
        ? "0 0 0 2px var(--maple-surface-base), 0 0 0 4px var(--maple-text-strong)"
        : "none"};
    transition: box-shadow 120ms ease;
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

const NameLink = styled(Internal)`
  color: inherit;
  text-decoration: none;
  &:hover {
    color: var(--maple-brand-primary);
    text-decoration: underline dotted;
    text-underline-offset: 3px;
  }
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
  return (
    <Portrait $ring={partyColor(c.party)} $lit={lit} $size={size}>
      <img
        src={`https://malegislature.gov/Legislators/Profile/170/${c.memberCode}.jpg`}
        alt={labelled ? c.name : ""}
        title={labelled ? c.name : undefined}
        loading="lazy"
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
 * One chamber's three, to stand beside that chamber's map. Pointing at a
 * person lights their district; the ring on the portrait marks the one being
 * read so the list can answer the map as well as the other way round.
 */
export function Conferees({
  court,
  chamber,
  conferees,
  mine,
  selected,
  onHover,
  onPin
}: {
  court: number
  chamber: Branch
  conferees: ConfereeView[]
  /** Member codes of the viewer's own legislators. */
  mine: Set<string>
  selected: string | null
  onHover: (key: string | null) => void
  onPin: (key: string) => void
}) {
  const { t } = useTranslation("conferences")
  const flags = useFlags()
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
                  type="button"
                  $back={Boolean(selected) && !lit}
                  aria-pressed={lit}
                  onPointerEnter={() => onHover(key)}
                  onPointerLeave={() => onHover(null)}
                  onFocus={() => onHover(key)}
                  onBlur={() => onHover(null)}
                  onClick={() => onPin(key)}
                >
                  <ConfereeFace c={c} lit={lit} own={own} />
                  <span className="min-w-0">
                    <Name>
                      <NameLink
                        href={
                          flags.legislators
                            ? maple.legislator({
                                court,
                                memberCode: c.memberCode
                              })
                            : `https://malegislature.gov/Legislators/Profile/${c.memberCode}`
                        }
                        onClick={e => e.stopPropagation()}
                      >
                        {shortName(c.name)}
                      </NameLink>
                      {c.chair && <Chair>{t("chair")}</Chair>}
                    </Name>
                    <Sub>{own ? t(yoursKey(c)) : c.district}</Sub>
                  </span>
                </Row>
              </li>
            )
          })}
      </List>
    </div>
  )
}
