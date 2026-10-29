import { ReactNode, useState } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { ConferenceTestimony } from "components/db"
import { jumpToSection } from "../navbar"
import { Pill, useCosign } from "./CosignButton"
import { ClampedText } from "./ClampedText"
import {
  Corner,
  Cosigned,
  Dated,
  Descriptor,
  Disc,
  LATEST_BESIDE,
  NoWords,
  When,
  Who,
  filedOn,
  lastCosignedOn
} from "./Entry"
import { AccountTypeIcon } from "./Pickers"
import { accountTypeOf, initialsOf, nameOf } from "./accounts"
import { BadgeCheck, UsersRound } from "./icons"
import { brand, ink, line, wash } from "./tokens"

/** Cosigns shown under a card before the rest wait behind a control. */
const COSIGNS_SHOWN = 3

const Strip = styled.p`
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 50px;
  margin: -20px -20px 16px;
  padding: 10px 20px;
  border-radius: 7px 7px 0 0;
  background: ${wash.default};
  font-size: 0.8125rem;
  line-height: 1.4;
  color: ${ink.midheavy};

  svg {
    flex-shrink: 0;
  }

  @media (max-width: 450px) {
    margin: -14px -14px 16px;
    padding: 10px 14px;
  }
`

const Link = styled.button`
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-weight: 600;
  color: ${brand.ink};
  text-decoration: underline dotted;
  text-underline-offset: 3px;
  &:hover {
    color: ${brand.fill};
  }
`

/** The card's Cosign, moved from its corner to the band's end. The band is
 * already grey, so it keeps its white on hover. */
const BandPill = styled(Pill)`
  margin: 0 0 0 auto;
  &:hover {
    background: var(--maple-surface-base);
  }
`

/**
 * The strip across the top of a cosigned card: how many stand behind it,
 * whether the reader is one of them, and the way to join them. It takes the
 * place of the card's corner Cosign.
 */
export function Band({
  testimony,
  yours
}: {
  testimony: ConferenceTestimony
  /** The reader has cosigned it. */
  yours: boolean
}) {
  const { t } = useTranslation("conferences")
  const cosign = useCosign(testimony)
  const count = testimony.cosignCount ?? 0
  return (
    <Strip>
      <UsersRound size={16} />
      <span>
        <b>{count}</b> {t("input.cosign_count", { count })}
        {yours && (
          <>
            {t("input.cosign_including_you")}
            <Link type="button" onClick={() => jumpToSection("your-input")}>
              {t("input.cosign_view_yours")}
            </Link>
          </>
        )}
      </span>
      {cosign && (
        <BandPill type="button" onClick={cosign}>
          {t("input.cosign")}
        </BandPill>
      )}
    </Strip>
  )
}

const Base = styled.div`
  display: flow-root;
  margin-top: 20px;
  font-size: 0.8125rem;
  color: ${ink.mid};
`

const Count = styled.span`
  float: left;
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    margin-right: 2px;
  }
`

const Districts = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  @media (max-width: 480px) {
    display: none;
  }
`

const Dot = styled.span`
  margin: 0 2px;
  color: ${ink.faint};
`

/** In a narrow window, a narrow card's latest date moves to its foot line
 * (Entry's LatestBeside); a wide card has none, so keeps it here. */
const Latest = styled.span<{ $wide: boolean }>`
  float: right;
  margin-left: 12px;
  line-height: 24px;
  white-space: nowrap;
  @media ${LATEST_BESIDE} {
    display: ${({ $wide }) => ($wide ? "inline" : "none")};
  }
`

/** The card's floor: how many cosigned, from how many districts, and when
 * the latest did. */
export function Floor({
  testimony,
  wide
}: {
  testimony: ConferenceTestimony
  /** The card is wide, so it has no foot line to take the latest date. */
  wide: boolean
}) {
  const { t, i18n } = useTranslation("conferences")
  const latest = lastCosignedOn(testimony, i18n.language)
  // Only the chambers someone cosigned from; a cosigner with no district on
  // file counts toward the total alone.
  const senate = testimony.cosignSenateDistrictCount ?? 0
  const house = testimony.cosignHouseDistrictCount ?? 0
  return (
    <Base>
      <Count>
        <BadgeCheck size={16} />
        <b>{testimony.cosignCount}</b>
        <span>{t("input.cosigned")}</span>
        <Districts>
          {senate > 0 && (
            <>
              <Dot aria-hidden>·</Dot>
              <b>{senate}</b>
              <span>{t("input.cosign_senate")}</span>
            </>
          )}
          {house > 0 && (
            <>
              <Dot aria-hidden>·</Dot>
              <b>{house}</b>
              <span>{t("input.cosign_house")}</span>
            </>
          )}
        </Districts>
      </Count>
      {latest && (
        <Latest $wide={wide}>
          {t("input.last_cosigned", { date: latest })}
        </Latest>
      )}
    </Base>
  )
}

/** The cosigns under a card, a tier quieter than it: a hairline rather than a
 * card of their own, a smaller portrait, and the words clamped short. The
 * card's name and chip are not repeated; the rows hang under them. */
const List = styled.ul<{ $wide: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 20px -20px 0;
  padding: 16px 20px 0 ${({ $wide }) => ($wide ? "78px" : "20px")};
  border-top: 1px solid ${line.default};
  list-style: none;

  @media (max-width: 450px) {
    margin: 16px -14px 0;
    padding: 14px 14px 0;
  }
`

const Row = styled.li`
  display: flex;
  gap: 12px;
`

const Small = styled(Disc)`
  width: 28px;
  height: 28px;
  font-size: 0.625rem;
  @media (max-width: 450px) {
    width: 22px;
    height: 22px;
    font-size: 0.5625rem;
  }
`

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
`

const NameRow = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.2;
  color: ${ink.strong};

  svg {
    width: 14px;
    height: 14px;
  }
`

const Name = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const RowDescriptor = styled(Descriptor)`
  margin-top: 4px;
`

const Note = styled.div`
  margin-top: 8px;
  color: ${ink.mid};
  p {
    color: inherit;
  }
`

const NarrowDate = styled.div`
  margin-top: 6px;
  font-size: 0.75rem;
  color: ${ink.mid};
`

const More = styled(Link)`
  align-self: flex-start;
  font-size: 0.8125rem;
`

/** The cosigns listed under the card they cosign, newest first, the first
 * few shown and the rest a press away. */
export function CosignList({
  cosigns,
  wide,
  actions
}: {
  cosigns: ConferenceTestimony[]
  /** The card is wide enough to hang the list under its words. */
  wide: boolean
  /** The kebab on each cosign. */
  actions: (cosign: ConferenceTestimony) => ReactNode
}) {
  const { t, i18n } = useTranslation("conferences")
  const [all, setAll] = useState(false)
  if (cosigns.length === 0) return null
  const hidden = cosigns.length - COSIGNS_SHOWN
  const shown = all ? cosigns : cosigns.slice(0, COSIGNS_SHOWN)
  return (
    <List $wide={wide}>
      {shown.map(c => {
        const name = nameOf(c)
        const type = accountTypeOf(c.authorRole)
        const date = filedOn(c, i18n.language)
        return (
          <Row key={`${c.authorUid}-${c.id}`}>
            <Small>{initialsOf(name)}</Small>
            <Who>
              <Head>
                <Who>
                  <NameRow>
                    <Name title={name}>{name}</Name>
                    <AccountTypeIcon type={type} />
                    <Cosigned>{t("input.cosigned")}</Cosigned>
                  </NameRow>
                  <RowDescriptor>{t(`input.descriptor_${type}`)}</RowDescriptor>
                </Who>
                <Corner>
                  {wide && (
                    <When $quiet={false} $banded={false}>
                      {date}
                    </When>
                  )}
                  {actions(c)}
                </Corner>
              </Head>
              <Note>
                {c.content ? (
                  <ClampedText text={c.content} lines={3} small />
                ) : (
                  <NoWords $small>{t("input.cosign_no_words")}</NoWords>
                )}
              </Note>
              {!wide && (
                <NarrowDate>
                  <Dated date={date} />
                </NarrowDate>
              )}
            </Who>
          </Row>
        )
      })}
      {hidden > 0 && (
        <li>
          <More type="button" onClick={() => setAll(x => !x)}>
            {all
              ? t("input.cosign_fewer")
              : t("input.cosign_more", { count: hidden })}
          </More>
        </li>
      )}
    </List>
  )
}
