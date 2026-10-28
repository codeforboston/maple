import { ReactNode, useRef } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { ConferencePosition, ConferenceTestimony } from "components/db"
import { AccountTypeIcon } from "./Pickers"
import { Body, ClampedText } from "./ClampedText"
import { accountTypeOf, initialsOf, nameOf } from "./accounts"
import { useInputContext } from "./context"
import { positionColours } from "./positions"
import { brand, ink, line, shadow } from "./tokens"
import { useWide } from "./useWide"

const Card = styled.article<{ $bare: boolean }>`
  position: relative;
  padding: 20px;
  ${({ $bare }) =>
    $bare
      ? ""
      : `background: var(--maple-surface-base);
  border: 1px solid ${line.default};
  border-radius: 8px;
  box-shadow: ${shadow.raised};`}

  @media (max-width: 450px) {
    padding: 14px;
  }
`

const Head = styled.div<{ $wide: boolean }>`
  display: flex;
  align-items: ${({ $wide }) => ($wide ? "center" : "flex-start")};
  gap: ${({ $wide }) => ($wide ? "18px" : "14px")};

  @media (max-width: 450px) {
    gap: ${({ $wide }) => ($wide ? "18px" : "9px")};
  }
`

export const Disc = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: ${brand.soft};
  border: 1px solid ${brand.edge};
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: ${brand.ink};
`

/** The card's own portrait, which the mockup brings down with the type: 34
 * at the site's narrow width, 26 on a phone, its letters a step smaller. */
const Portrait = styled(Disc)`
  @media (max-width: 767px) {
    width: 34px;
    height: 34px;
    font-size: 0.625rem;
  }
  @media (max-width: 450px) {
    width: 26px;
    height: 26px;
  }
`

export const Who = styled.div`
  flex: 1;
  min-width: 0;
`

const NameRow = styled.p`
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  color: ${ink.strong};

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 767px) {
    svg {
      width: 14px;
      height: 14px;
    }
  }
  @media (max-width: 450px) {
    gap: 4px;
    font-size: 0.8125rem;
    svg {
      width: 13px;
      height: 13px;
    }
  }
`

const Name = styled.span`
  min-width: 0;
`

export const Cosigned = styled.span`
  font-weight: 400;
  color: ${ink.mid};
`

/** The cosigned entry's name, which opens it where the caller can. */
const ParentName = styled.button`
  min-width: 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  text-decoration: underline dotted ${ink.faint};
  text-underline-offset: 3px;
  &:disabled {
    cursor: text;
  }
  &:hover:not(:disabled) {
    text-decoration-color: ${ink.mid};
  }
`

/** A cosign posted without words of its own says so, set apart from words. */
export const NoWords = styled(Body)`
  font-style: italic;
  color: ${ink.faint};
`

const Chip = styled.span<{ $bg: string; $ink: string }>`
  flex-shrink: 0;
  padding: 1px 8px;
  border-radius: 9999px;
  background: ${({ $bg }) => $bg};
  color: ${({ $ink }) => $ink};
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;

  @media (max-width: 450px) {
    padding: 1px 6px;
    font-size: 0.625rem;
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
    <Chip $bg={chipBg} $ink={chipInk}>
      {t(`input.position.${position}.${long ? "long" : "short"}`)}
    </Chip>
  )
}

export const Descriptor = styled.p`
  margin: 8px 0 0;
  font-size: 0.75rem;
  line-height: 1.4;
  color: ${ink.faint};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const When = styled.span<{ $quiet: boolean; $banded: boolean }>`
  margin-right: 2px;
  font-size: ${({ $banded }) => ($banded ? "0.8125rem" : "0.75rem")};
  white-space: nowrap;
  color: ${({ $quiet }) => ($quiet ? ink.faint : ink.mid)};
`

export const Corner = styled.div`
  display: flex;
  align-items: center;
  align-self: flex-start;
  gap: 2px;
  margin: -5px -6px 0 0;
  flex-shrink: 0;
`

const Words = styled.div`
  display: flex;
  gap: 18px;
`

const Indent = styled.div`
  width: 40px;
  flex-shrink: 0;
`

const Text = styled.div<{ $wide: boolean; $banded: boolean }>`
  flex: 1;
  min-width: 0;
  padding: ${({ $wide, $banded }) =>
    $banded
      ? $wide
        ? "12px 12px 0 0"
        : "16px 0 0"
      : $wide
      ? "8px 12px 8px 0"
      : "12px 0 4px"};
`

const FootDate = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 12px;
  font-size: 0.8125rem;
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

/** When the latest cosign was filed, written out. */
export const lastCosignedOn = (
  testimony: Pick<ConferenceTestimony, "lastCosignedAt">,
  language: string
) => testimony.lastCosignedAt && longDate(testimony.lastCosignedAt, language)

/** The screen width at and under which the floor has no room for the latest
 * cosign's date, which moves to the foot line beside the filing's own. */
export const LATEST_BESIDE = "(max-width: 900px)"

const LatestBeside = styled.span`
  display: none;
  white-space: nowrap;
  @media ${LATEST_BESIDE} {
    display: inline;
  }
`

const Dot = styled.span`
  margin-left: 6px;
  color: ${ink.faint};
`

/** One filing: who wrote it, what they asked for, and their words. A cosign
 * names what it cosigns, and its position is that entry's. */
export function Entry({
  testimony,
  actions,
  lead,
  onOpen,
  bare = false,
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
  const wide = useWide(ref, 600)
  const type = accountTypeOf(testimony.authorRole)
  const date = filedOn(testimony, i18n.language)
  const name = nameOf(testimony)
  // A cosigned card carries the latest cosign's date too, which makes the
  // filing's own the quieter of two.
  const latest = band ? lastCosignedOn(testimony, i18n.language) : undefined

  return (
    <Card ref={ref} $bare={bare}>
      {band}
      <Head $wide={wide}>
        <Portrait>{initialsOf(name)}</Portrait>
        <Who>
          <NameRow>
            <Name title={name}>{name}</Name>
            <AccountTypeIcon type={type} />
            {parent && (
              <>
                <Cosigned>{t("input.cosigned")}</Cosigned>
                <ParentName
                  type="button"
                  disabled={!onOpen}
                  onClick={() => onOpen?.(parent)}
                >
                  {nameOf(parent)}
                </ParentName>
                <AccountTypeIcon type={accountTypeOf(parent.authorRole)} />
              </>
            )}
            <PositionChip position={testimony.position} />
          </NameRow>
          <Descriptor>{t(`input.descriptor_${type}`)}</Descriptor>
        </Who>
        <Corner>
          {lead}
          {wide && (
            <When $quiet={!!latest} $banded={!!band}>
              {date}
            </When>
          )}
          {actions}
        </Corner>
      </Head>
      <Words>
        {wide && <Indent aria-hidden />}
        <Text $wide={wide} $banded={!!band}>
          {testimony.cosignOfId && !testimony.content ? (
            <NoWords $small={!wide}>{t("input.cosign_no_words")}</NoWords>
          ) : fullBody ? (
            <Body $small={!wide}>{testimony.content}</Body>
          ) : (
            <ClampedText text={testimony.content} small={!wide} />
          )}
          {!wide && (
            <FootDate>
              {latest && (
                <LatestBeside>
                  {t("input.last_cosigned_short", { date: shortMonth(latest) })}
                  <Dot aria-hidden>·</Dot>
                </LatestBeside>
              )}
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
