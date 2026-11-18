import { ReactNode, useRef } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { ConferencePosition, ConferenceTestimony } from "components/db"
import { AccountTypeIcon } from "./Pickers"
import { Body, ClampedText } from "./ClampedText"
import { accountTypeOf, initialsOf, nameOf } from "./accounts"
import { useInputContext } from "./context"
import { positionColours } from "./positions"
import { sc, SMALL_SCALE } from "./scale"
import { brand, ink, line, shadow } from "./tokens"
import { useWide } from "./useWide"

/** Its text in Nunito, as the page's other cards' is. Every length in it
 * scales with `--entry-scale` (sc, scale.ts): small (`$small`), it is the
 * card at SMALL_SCALE. Flush (`$flush`, a cosign in context, Entry's
 * `inContext`), it has no padding of its own, the list it hangs in placing
 * it (Cosigns.tsx). */
const Card = styled.article<{
  $bare: boolean
  $small: boolean
  $flush: boolean
}>`
  position: relative;
  padding: 20px;
  font-family: var(--maple-font-body);
  /* The reader's own card is set as any other (YouMark). */
  ${({ $bare }) =>
    $bare
      ? ""
      : `background: var(--maple-surface-base);
  border: 1px solid ${line.default};
  border-radius: 5px;
  box-shadow: ${shadow.raised};`}

  @media (max-width: 450px) {
    padding: 14px;
  }

  ${({ $small }) => ($small ? `--entry-scale: ${SMALL_SCALE};` : "")}
  ${({ $flush }) =>
    $flush
      ? `&& {
    padding: 0;
  }`
      : ""}
`

/** The portrait and who it is, the two centred on each other at every
 * width; the corner keeps to the top (Corner). */
const Head = styled.div<{ $wide: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ $wide }) => ($wide ? sc(18) : sc(14))};

  @media (max-width: 450px) {
    gap: ${({ $wide }) => ($wide ? sc(18) : sc(9))};
  }
`

/** A person's initials in a disc, 40px unless `--disc` says otherwise. The
 * initials and the room between them are always the same share of the
 * disc, 13px letters 1px apart at 40px, so a smaller or larger disc sets
 * only `--disc` and they scale with it. The reader's own (`$own`) is the
 * same disc inside, ringed around in MAPLE blue, with "You" over its foot
 * (YouBand). */
export const Disc = styled.div<{ $own?: boolean }>`
  --disc: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--disc);
  height: var(--disc);
  border-radius: 9999px;
  background: ${brand.soft};
  /* The reader's own, from the inside out: its usual 1px edge moved 1px in,
     its edge white, and around the disc a 2px white gap and a 2px MAPLE blue
     ring at 40px, scaling with the disc. Drawn, not laid out, so nothing
     around the disc moves. (Tried after, then dropped: the edge alone in
     its usual colour at 2px and 3px reaching out, or 2px reaching in; a 1px
     blue edge with a 1px ring of the usual colour, either way round; a 2px
     blue rim inside the disc, with and without a 2px white ring.) */
  border: 1px solid
    ${({ $own }) => ($own ? "var(--maple-surface-base)" : brand.edge)};
  box-shadow: ${({ $own }) =>
    $own
      ? `inset 0 0 0 1px ${brand.edge},
    0 0 0 calc(var(--disc) * 0.05) var(--maple-surface-base),
    0 0 0 calc(var(--disc) * 0.1) var(--maple-brand-primary)`
      : "none"};
  /* The initials in the card's Nunito, semibold. (In Lexend at 500 for a
     while: font-family var(--maple-font-heading).) */
  font-size: calc(var(--disc) * 0.325);
  font-weight: 600;
  letter-spacing: calc(var(--disc) * 0.025);
  /* Letter spacing also falls after the last letter, which would sit the
     initials left of centre by half of it: as much room before the first. */
  padding-left: calc(var(--disc) * 0.025);
  color: ${brand.ink};

  /* The reader's own carries a pill (YouBand) laid over its foot; the disc
     itself, initials and all, is as any other's. */
  ${({ $own }) => ($own ? "position: relative;" : "")}
`

/** "You" in a MAPLE blue pill hovering over the foot of the reader's own
 * avatar (Disc's `$own`), centred, edged in white so it stands off the
 * avatar and the card; sized from the disc as its initials are, and the
 * disc does not move for it. The word is drawn from `data-label` rather
 * than written in the page, so the page says it once, in the name line,
 * where a screen reader hears it (YouMark). */
const YouBand = styled.span`
  position: absolute;
  left: 50%;
  /* Its middle 2px under the disc's foot at 40px, the pill 12px tall: 1px
     above where it sat, middle on a blue ring's, before the experiments
     with it (disc * -0.225). (Tried since, then dropped: its middle on the
     disc's foot, disc * -0.15; under the avatar; clipped to the avatar's
     circle, with a light pill.) */
  bottom: calc(var(--disc) * -0.2);
  transform: translateX(-50%);
  height: calc(var(--disc) * 0.3);
  display: flex;
  align-items: center;
  padding: 0 calc(var(--disc) * 0.15);
  border-radius: 9999px;
  background: var(--maple-brand-primary);
  box-shadow: 0 0 0 calc(var(--disc) * 0.0375) var(--maple-surface-base);
  color: #fff;
  /* "YOU" in the initials' face, bold capitals a little apart. */
  font-size: calc(var(--disc) * 0.175);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;

  &::after {
    content: attr(data-label);
  }
`

/** The card's own portrait, which the mockup brings down with the type: 40,
 * 34 at the site's narrow width, 26 on a phone, each scaled with the card
 * (sc). Doubled (&&) so each holds over Disc's own size whatever order the
 * styles load in. */
const Portrait = styled(Disc)`
  && {
    --disc: ${sc(40)};
  }
  @media (max-width: 767px) {
    && {
      --disc: ${sc(34)};
    }
  }
  @media (max-width: 450px) {
    && {
      --disc: ${sc(26)};
    }
  }
`

export const Who = styled.div`
  flex: 1;
  min-width: 0;
`

const NameRow = styled.p`
  /* Names in the card's Nunito, 500, 15px at every width; the names with
     their icons (Names) and the chip on one centre line. */
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${sc(6)};
  margin: 0;
  font-size: ${sc(15)};
  font-weight: 500;
  line-height: 1;
  color: ${ink.strong};

  /* The position chip at 11px on the card, at every width; the newsfeed's
     keeps its own. */
  .position-chip {
    font-size: ${sc(11)};
  }

  /* The account icons: 15px, 13px under 768px, 12px on a phone. */
  svg {
    width: ${sc(15)};
    height: ${sc(15)};
  }

  @media (max-width: 767px) {
    svg {
      width: ${sc(13)};
      height: ${sc(13)};
    }
  }
  @media (max-width: 450px) {
    gap: ${sc(4)};
    svg {
      width: ${sc(12)};
      height: ${sc(12)};
    }
  }
`

/** Who filed it: the author (Person), and on a cosign, "cosigned" and the
 * cosigned author (ParentName), standing on one baseline with each other,
 * their letters on one line and any descenders hanging below it; the whole
 * is centred on the chip beside it (NameRow). Spaced as the line is. */
const Names = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: inherit;
  min-width: 0;
`

/** How far an account icon drops below the name's baseline: about half the
 * room the font keeps under its letters, so it sits between standing on the
 * letters' line and the bottom of the name's line. */
const iconDrop = `
  svg {
    position: relative;
    top: 0.09em;
  }
`

/** One person in the name line: the author's name and account icon, the
 * icon on the name's baseline, dropped a little below it (iconDrop), as the
 * cosigned author's is (ParentName). */
const Person = styled.span`
  display: inline-flex;
  align-items: baseline;
  ${iconDrop}
  gap: inherit;
  min-width: 0;
`

/** The author's name, its letters a little apart (2%), as the cosigned
 * author's are (ParentName). */
const Name = styled.span`
  min-width: 0;
  letter-spacing: 0.02em;
`

export const Cosigned = styled.span`
  font-weight: 400;
  color: ${ink.mid};
`

/** The cosigned entry's name and account icon, one target that opens it
 * where the caller can. The dotted line runs under both, so it is drawn as
 * the button's bottom edge: an underline would stop at the icon. Inside,
 * the icon sits by the name's baseline as the author's does (Person). */
const ParentName = styled.button`
  display: inline-flex;
  align-items: baseline;
  ${iconDrop}
  gap: inherit;
  min-width: 0;
  /* The dotted line 4px further under the name; the room it and the line's
     own 1px add below are taken back, so the name line is no taller. */
  padding: 0 0 4px;
  margin-bottom: -5px;
  border: 0;
  border-bottom: 1px dotted ${ink.faint};
  background: none;
  font: inherit;
  letter-spacing: 0.02em;
  color: inherit;
  text-align: left;
  &:disabled {
    cursor: text;
  }
  &:hover:not(:disabled) {
    border-bottom-color: ${ink.mid};
  }
`

/** A cosign posted without words of its own says so, set apart from words,
 * except under its input (Entry's `inContext`), where it says nothing unless
 * asked to (Entry's `showNoWords`). */
export const NoWords = styled(Body)`
  font-style: italic;
  color: ${ink.faint};
`

const Chip = styled.span<{ $bg: string; $ink: string }>`
  /* Lexend, as every chip on the conference pages, in Nunito cards too. */
  font-family: var(--maple-font-heading);
  flex-shrink: 0;
  padding: ${sc(2)} ${sc(9)};
  border-radius: 9999px;
  background: ${({ $bg }) => $bg};
  color: ${({ $ink }) => $ink};
  font-size: ${sc(11)};
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;

  @media (max-width: 450px) {
    padding: ${sc(2)} ${sc(7)};
    font-size: ${sc(10)};
  }
`

/** A filing's stance, coloured as on the mockup: the short label on a card,
 * the long one where the stance stands alone, as in the newsfeed. */
export function PositionChip({
  position,
  long = false
}: {
  position: ConferencePosition
  long?: boolean
}) {
  const { t } = useTranslation("conferences")
  const { chipBg, chipInk } = positionColours[position]
  return (
    <Chip className="position-chip" $bg={chipBg} $ink={chipInk}>
      {t(`input.position.${position}.${long ? "long" : "short"}`)}
    </Chip>
  )
}

/** What marks the reader's own filing in its name line, for a screen reader
 * alone: the eye has the "You" on the avatar (YouBand), which a screen reader
 * does not hear. */
export function YouMark() {
  const { t } = useTranslation("conferences")
  return <span className="visually-hidden">{t("input.you")}</span>
}

/** The kind of account, under the name and close to it: one line, cut
 * rather than wrapped, so no taller than its letters need. */
export const Descriptor = styled.p`
  margin: ${sc(4)} 0 0;
  font-size: ${sc(13)};
  line-height: 1.2;
  color: ${ink.faint};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

/** The date a card was filed, at its corner: 13px and in the date's grey on
 * every card, a cosigned one too. */
export const When = styled.span`
  margin-right: ${sc(2)};
  font-size: ${sc(13)};
  white-space: nowrap;
  color: ${ink.mid};
`

export const Corner = styled.div`
  display: flex;
  align-items: center;
  align-self: flex-start;
  gap: ${sc(2)};
  margin: ${sc(-5)} ${sc(-6)} 0 0;
  flex-shrink: 0;
`

const Words = styled.div`
  display: flex;
  gap: ${sc(18)};
`

/** As wide as the portrait (Portrait's 40px), so the words start under the
 * name. */
const Indent = styled.div`
  width: ${sc(40)};
  flex-shrink: 0;
`

/** The words. Flush (a cosign row, Cosigns.tsx), with no room under them,
 * so the line between cosigns has as much over it as under it. */
const Text = styled.div<{ $wide: boolean; $banded: boolean; $flush: boolean }>`
  flex: 1;
  min-width: 0;
  padding: ${({ $wide, $banded }) =>
    $banded
      ? $wide
        ? `${sc(12)} ${sc(12)} 0 0`
        : `${sc(16)} 0 0`
      : $wide
      ? `${sc(8)} ${sc(12)} ${sc(8)} 0`
      : `${sc(12)} 0 ${sc(4)}`};
  ${({ $flush }) => ($flush ? "padding-bottom: 0;" : "")}
`

/** The date at the foot of a narrow card, at the size it has at a wide
 * card's corner (When). */
const FootDate = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${sc(6)};
  margin-top: ${sc(12)};
  font-size: ${sc(13)};
  color: ${ink.mid};
`

/** A day written out. */
const longDate = (at: { toDate: () => Date }, language: string) =>
  at.toDate().toLocaleDateString(language, {
    year: "numeric",
    month: "long",
    day: "numeric"
  })

/** The day an entry was filed, written out. */
export const filedOn = (
  testimony: Pick<ConferenceTestimony, "publishedAt">,
  language: string
) => longDate(testimony.publishedAt, language)

/** A date with its month cut to three letters, as the mockup sets dates on a
 * phone, where "October" and "September" push a line into two. */
export const shortMonth = (d: string) =>
  d.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/,
    m => (m.length > 4 ? `${m.slice(0, 3)}.` : m)
  )

/** The full date on wide screens and the short one on a phone. */
export function Dated({ date }: { date: string }) {
  return (
    <>
      <Long>{date}</Long>
      <Short>{shortMonth(date)}</Short>
    </>
  )
}

const Long = styled.span`
  @media (max-width: 450px) {
    display: none;
  }
`

const Short = styled.span`
  display: none;
  @media (max-width: 450px) {
    display: inline;
  }
`

/** One filing: who wrote it, what they asked for, and their words. A cosign
 * names what it cosigns, and its position is that entry's. */
export function Entry({
  testimony,
  actions,
  lead,
  onOpen,
  bare = false,
  small = false,
  inContext = false,
  showNoWords = false,
  undated = false,
  own = false,
  fullBody = false,
  band,
  floor,
  children
}: {
  testimony: ConferenceTestimony
  /** The kebab at the corner. */
  actions?: React.ReactNode
  /** What goes before the date at the corner. */
  lead?: React.ReactNode
  /** Open another entry: here, the one a cosign cosigns. */
  onOpen?: (testimony: ConferenceTestimony) => void
  /** Without the card's own edge, for a caller that draws one around it. */
  bare?: boolean
  /** The card made smaller (SMALL_SCALE), every length with it. Unused for
   * now: the cosign rows were drawn so, and are the card's size again. */
  small?: boolean
  /** A cosign shown in the context of the input it cosigns, in the list under
   * that input's card (Cosigns.tsx). For now it is drawn as a cosign is
   * anywhere else, only without the card's edge and padding, the list
   * placing it. What the in-context look changes belongs here, so the
   * default stays as it is: the cosign with all its context, which names
   * and links the input it cosigns, the source of truth for sharing a
   * cosign on its own (as over the AT Protocol). */
  inContext?: boolean
  /** In context, a cosign without words of its own says so (NoWords), as it
   * does anywhere else. Off by default: in context it says nothing. */
  showNoWords?: boolean
  /** Without its date, in the corner or at the foot: for a preview of what
   * is not filed yet (Review.tsx's SitePreview). */
  undated?: boolean
  /** The reader's own filing, marked as theirs. */
  own?: boolean
  /** The words whole, with no clamp: for where the entry is the point. */
  fullBody?: boolean
  /** The strip across the top of a cosigned card. */
  band?: ReactNode
  /** The tally under the words of a cosigned card, given whether the card is
   * wide. */
  floor?: (wide: boolean) => ReactNode
  /** What hangs under the card's words, given whether the card is wide: its
   * cosigns. */
  children?: (wide: boolean) => ReactNode
}) {
  const { t, i18n } = useTranslation("conferences")
  const { byId } = useInputContext()
  const parent = testimony.cosignOfId
    ? byId.get(testimony.cosignOfId)
    : undefined
  const ref = useRef<HTMLElement>(null)
  // Wide from 600px, or the same share of that for a smaller card.
  const wide = useWide(ref, small ? 600 * SMALL_SCALE : 600)
  const type = accountTypeOf(testimony.authorRole)
  const date = filedOn(testimony, i18n.language)
  const name = nameOf(testimony)

  return (
    <Card ref={ref} $bare={bare || inContext} $small={small} $flush={inContext}>
      {band}
      <Head $wide={wide}>
        <Portrait $own={own}>
          {initialsOf(name)}
          {own && <YouBand aria-hidden data-label={t("input.you")} />}
        </Portrait>
        <Who>
          <NameRow>
            <Names>
              <Person>
                <Name title={name}>{name}</Name>
                <AccountTypeIcon type={type} />
              </Person>
              {/* In context, under the input it cosigns, a cosign says it
                  cosigned "this position" rather than naming it, and does not
                  repeat its position: both are the card's above it. */}
              {parent && inContext && (
                <Cosigned>{t("input.cosigned_this")}</Cosigned>
              )}
              {parent && !inContext && (
                <>
                  <Cosigned>{t("input.cosigned")}</Cosigned>
                  <ParentName
                    type="button"
                    disabled={!onOpen}
                    onClick={() => onOpen?.(parent)}
                  >
                    {nameOf(parent)}
                    <AccountTypeIcon type={accountTypeOf(parent.authorRole)} />
                  </ParentName>
                </>
              )}
            </Names>
            {!inContext && <PositionChip position={testimony.position} />}
            {own && <YouMark />}
          </NameRow>
          <Descriptor>{t(`input.descriptor_${type}`)}</Descriptor>
        </Who>
        <Corner>
          {lead}
          {wide && !undated && <When>{date}</When>}
          {actions}
        </Corner>
      </Head>
      <Words>
        {wide && <Indent aria-hidden />}
        <Text $wide={wide} $banded={!!band} $flush={inContext}>
          {testimony.cosignOfId && !testimony.content ? (
            // Under its input, a cosign without words says nothing, unless
            // asked to (showNoWords).
            (!inContext || showNoWords) && (
              <NoWords $small={!wide}>{t("input.cosign_no_words")}</NoWords>
            )
          ) : fullBody ? (
            <Body $small={!wide}>{testimony.content}</Body>
          ) : (
            <ClampedText text={testimony.content} small={!wide} />
          )}
          {!wide && !undated && (
            <FootDate>
              <Dated date={date} />
            </FootDate>
          )}
          {floor?.(wide)}
        </Text>
      </Words>
      {children?.(wide)}
    </Card>
  )
}
