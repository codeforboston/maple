import { useRef } from "react"
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

const Who = styled.div`
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

  @media (max-width: 450px) {
    gap: 4px;
    font-size: 0.8125rem;
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

const When = styled.span`
  margin-right: 2px;
  font-size: 0.75rem;
  white-space: nowrap;
  color: ${ink.mid};
`

const Corner = styled.div`
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

const Text = styled.div<{ $wide: boolean }>`
  flex: 1;
  min-width: 0;
  padding: ${({ $wide }) => ($wide ? "8px 12px 8px 0" : "12px 0 4px")};
`

const FootDate = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  font-size: 0.8125rem;
  color: ${ink.mid};
`

/** The day an entry was filed, written out. */
export const filedOn = (
  testimony: Pick<ConferenceTestimony, "publishedAt">,
  language: string
) =>
  testimony.publishedAt.toDate().toLocaleDateString(language, {
    year: "numeric",
    month: "long",
    day: "numeric"
  })

/** One filing: who wrote it, what they asked for, and their words. A cosign
 * names what it cosigns, and its position is that entry's. */
export function Entry({
  testimony,
  actions,
  lead,
  onOpen,
  bare = false,
  fullBody = false
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

  return (
    <Card ref={ref} $bare={bare}>
      <Head $wide={wide}>
        <Disc>{initialsOf(name)}</Disc>
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
          {wide && <When>{date}</When>}
          {actions}
        </Corner>
      </Head>
      <Words>
        {wide && <Indent aria-hidden />}
        <Text $wide={wide}>
          {testimony.cosignOfId && !testimony.content ? (
            <NoWords $small={!wide}>{t("input.cosign_no_words")}</NoWords>
          ) : fullBody ? (
            <Body $small={!wide}>{testimony.content}</Body>
          ) : (
            <ClampedText text={testimony.content} small={!wide} />
          )}
          {!wide && <FootDate>{date}</FootDate>}
        </Text>
      </Words>
    </Card>
  )
}
