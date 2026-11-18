import { ReactNode, useState } from "react"
import { useTranslation } from "next-i18next"
import styled, { css } from "styled-components"
import { TABS_H } from "../ConferenceTabs"
import { ConferenceTestimony } from "components/db"
import { jumpToSection } from "../navbar"
import { Pill, useCosign } from "./CosignButton"
import { Descriptor, Disc, Entry } from "./Entry"
import { BadgeCheck, UsersRound } from "./icons"
import { brand, ink, line, wash } from "./tokens"

/** Where a jump to a block of Public Input parks it: under the bars. */
export const parked = css`
  scroll-margin-top: calc(
    var(--maple-navbar-height) + var(--title-h, 5rem) + ${TABS_H} + 1.5rem
  );
`

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

/** The card's floor: how many cosigned. */
export function Floor({ testimony }: { testimony: ConferenceTestimony }) {
  const { t } = useTranslation("conferences")
  return (
    <Base>
      <Count>
        <BadgeCheck size={16} />
        <b>{testimony.cosignCount}</b>
        <span>{t("input.cosigned")}</span>
      </Count>
    </Base>
  )
}

/** The cosigns under a card, each a cosign in the context of that card's
 * input (Entry's `inContext`), under a hairline. */
const List = styled.ul<{ $wide: boolean }>`
  /* No gap: the line between cosigns holds their room (Row), and the way
     to the rest its own (MoreItem). */
  display: flex;
  flex-direction: column;
  margin: 20px -20px 0;
  /* At the foot, the room the last cosign's words no longer keep under
     themselves in context (Entry's Text), so the card ends as it did. */
  padding: 16px 20px 8px ${({ $wide }) => ($wide ? "78px" : "20px")};
  border-top: 1px solid ${line.default};
  list-style: none;

  @media (max-width: 450px) {
    margin: 16px -14px 0;
    padding: 14px 14px 4px;
  }
`

/** One cosign, which a jump to the reader's own parks under the bars. From
 * the second on, a faint line between it and the one above, the line
 * holding the room on both sides of itself: 20px over it and 24px under
 * (18px and 22px on a phone), the 4px more under making up for the room the
 * words above keep under their last line. Its black at 7%, between the
 * panel's two washes (wash.default's 5% and wash.strong's 9%). */
const Row = styled.li`
  ${parked}

  & + &::before {
    content: "";
    display: block;
    height: 1px;
    margin: 20px 0 24px;
    background: rgba(0, 0, 0, 0.07);
  }
  @media (max-width: 450px) {
    & + &::before {
      margin: 18px 0 22px;
    }
  }
`

/** The way to the rest, 14px under the last cosign shown. */
const MoreItem = styled.li`
  margin-top: 14px;
`

/** A cosign's initials (Disc) where the cosign is drawn on its own, as the
 * cosign form's preview draws it: a step under the card's (Entry's
 * Portrait) on its 6px scale, where each step takes 2px off the letters:
 * 34px (11px letters), 28px under 768px, 22px on a phone. Doubled (&&) so it
 * holds over Disc's own size whatever order the styles load in. */
export const CosignDisc = styled(Disc)`
  && {
    --disc: 34px;
  }
  @media (max-width: 767px) {
    && {
      --disc: 28px;
    }
  }
  @media (max-width: 450px) {
    && {
      --disc: 22px;
    }
  }
`

/** A cosign's kind of account (Descriptor) where the cosign is drawn on its
 * own, closer under its smaller name: the cosign form's preview. */
export const CosignDescriptor = styled(Descriptor)`
  && {
    margin-top: 2px;
  }
`

const More = styled(Link)`
  align-self: flex-start;
  font-size: 0.8125rem;
`

/** The cosigns listed under the card they cosign, newest first, the first
 * few shown and the rest a press away. */
export function CosignList({
  cosigns,
  mine,
  wide,
  actions,
  showNoWords = false
}: {
  cosigns: ConferenceTestimony[]
  /** The reader's own filing: if it is one of these, its row is theirs. */
  mine?: ConferenceTestimony
  /** The card is wide enough to hang the list under its words. */
  wide: boolean
  /** The kebab on each cosign. */
  actions: (cosign: ConferenceTestimony) => ReactNode
  /** A cosign without words says so (Entry's `showNoWords`). Off by
   * default. */
  showNoWords?: boolean
}) {
  const { t } = useTranslation("conferences")
  const [all, setAll] = useState(false)
  if (cosigns.length === 0) return null
  const hidden = cosigns.length - COSIGNS_SHOWN
  const shown = all ? cosigns : cosigns.slice(0, COSIGNS_SHOWN)
  return (
    <List $wide={wide}>
      {shown.map(c => (
        <Row
          key={`${c.authorUid}-${c.id}`}
          id={c === mine ? "your-input" : undefined}
        >
          <Entry
            testimony={c}
            inContext
            showNoWords={showNoWords}
            own={c === mine}
            actions={actions(c)}
          />
        </Row>
      ))}
      {hidden > 0 && (
        <MoreItem>
          <More type="button" onClick={() => setAll(x => !x)}>
            {all
              ? t("input.cosign_fewer")
              : t("input.cosign_more", { count: hidden })}
          </More>
        </MoreItem>
      )}
    </List>
  )
}
