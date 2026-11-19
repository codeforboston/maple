import { ReactNode, useEffect, useRef } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { isSitting } from "../../functions/src/shared"
import { formatBillId } from "../formatting"
import { Internal, maple } from "../links"
import { conferenceName, ConferenceSummary } from "./types"

/** In Lexend, the conference names and bill numbers alike. Pinned at the
 * navbar's edge, as the title is (ConferenceDetails.tsx, TitleBand), and with
 * the title's 1.625rem above its first row, so the two start level. */
const Nav = styled.nav`
  font-family: var(--maple-font-heading);
  flex: 0 0 auto;
  /* 288px at 1440px, giving up 1px for every 10px the page narrows (the
     window, less the input panel beside it: --page-w, ConferenceDetails.tsx),
     until the compact rail takes over (FULL_RAIL_FROM, styles.ts). */
  width: clamp(
    200px,
    calc(243.2px + (var(--page-w, 100vw) - 992px) * 0.1),
    288px
  );
  position: sticky;
  top: var(--maple-navbar-height);
  align-self: flex-start;
  max-height: calc(100vh - var(--maple-navbar-height));
  overflow-y: auto;
  padding: 1.625rem 0 3rem;
`

/** The light line both the rules between the rows and the selected row's
 * outline are drawn in: a whole pixel of the site's border colour
 * (rgba(15, 23, 42, 0.12)) at half its strength. A half-pixel line looks the
 * same but drops out where the rail's edge falls between pixels. */
const RULE = "rgba(15, 23, 42, 0.06)"

/** The rows with a light rule between each. */
const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;

  li + li {
    border-top: 1px solid ${RULE};
  }

  /* The same line above the first and below the last, closing the list. */
  li:first-child {
    border-top: 1px solid ${RULE};
  }
  li:last-child {
    border-bottom: 1px solid ${RULE};
  }
`

/** `$filed`: the committee has filed its report, so its row is dimmed as a
 * whole, unless it is the one being read. `$covered`: false where we haven't
 * covered it, so its name is muted, even while it is the one being read. */
const RailRow = styled(Internal)<{
  $on: boolean
  $filed: boolean
  $covered: boolean
}>`
  display: block;
  overflow: hidden;
  border-left: 3px solid
    ${({ $on }) => ($on ? "var(--maple-brand-primary)" : "transparent")};
  /* Tighter than 0.75rem above and below. */
  padding: calc(0.5rem + 2px) 0.75rem calc(0.5rem + 2px) 1rem;
  border-radius: 0 var(--maple-radius-md) var(--maple-radius-md) 0;
  background: ${({ $on }) => ($on ? "var(--maple-surface-base)" : "none")};
  box-shadow: ${({ $on }) => ($on ? `inset 0 0 0 1px ${RULE}` : "none")};
  text-decoration: none;
  transition: background-color 120ms ease;
  opacity: ${({ $on, $filed }) => ($filed && !$on ? 0.5 : 1)};

  &:hover {
    background: ${({ $on }) =>
      $on ? "var(--maple-surface-base)" : "rgba(0, 0, 0, 0.05)"};
  }

  .name {
    display: block;
    font-size: 0.875rem;
    line-height: 1.35;
    font-weight: ${({ $on }) => ($on ? 600 : 300)};
    /* An uncovered conference's name stays muted even while it is the one
       being read. */
    color: ${({ $on, $covered }) =>
      !$covered
        ? "var(--maple-text-muted)"
        : $on
        ? "var(--maple-brand-primary)"
        : "var(--maple-text-strong)"};
  }
  .bills {
    display: block;
    margin-top: 1px;
    font-size: 0.75rem;
    line-height: 1.35;
    color: var(--maple-text-muted);
  }
  .status {
    margin-left: 0.375rem;
    font-style: italic;
  }
`

/** "S.1234 · H.5678", the status once the conference has finished, and a
 * label where we haven't covered it. The caller styles `.status`. */
export function BillLine({
  c,
  noteUncovered = true
}: {
  c: ConferenceSummary
  /** "Not covered" where we haven't covered it; off in the Explorer's
   * table (ConferenceTable). */
  noteUncovered?: boolean
}) {
  const { t } = useTranslation("conferences")
  return (
    <>
      {formatBillId(c.senateBillId)} · {formatBillId(c.houseBillId)}
      {c.status !== "appointed" && (
        <span className="status">{t(`status.${c.status}`)}</span>
      )}
      {noteUncovered && !c.covered && (
        <span className="status">{t("not_covered")}</span>
      )}
    </>
  )
}

/**
 * Every conference, down the left, with the one being read marked by a bar.
 * In the flow rather than absolute: the column is the page's navigation
 * between conferences, so it stays where a reader found it.
 */
export function ConferenceRail({
  conferences,
  current,
  fold,
  className
}: {
  conferences: ConferenceSummary[]
  current: string
  fold: ClosedFold
  className?: string
}) {
  const { t } = useTranslation("conferences")
  const nav = useRef<HTMLElement>(null)
  // The conference being read kept in view in the rail, which scrolls on its
  // own: one at the bottom (not in the trial) would otherwise sit out of
  // sight. Only the rail scrolls, not the page.
  useEffect(() => {
    const box = nav.current
    const row = box?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!box || !row) return
    const top =
      row.getBoundingClientRect().top -
      box.getBoundingClientRect().top +
      box.scrollTop
    if (
      top < box.scrollTop ||
      top + row.offsetHeight > box.scrollTop + box.clientHeight
    )
      box.scrollTop = top - (box.clientHeight - row.offsetHeight) / 2
  }, [current])
  return (
    <Nav ref={nav} aria-label={t("in_conference")} className={className}>
      <RailList conferences={conferences} current={current} fold={fold} />
    </Nav>
  )
}

/** The conferences the rail lists, and the picker that stands in for it
 * (ConferencePicker.tsx): those still sitting, then the rest, past, folded
 * under them (PastFold); in each, those not in the trial ("Not covered") at
 * the bottom, each group in its order. */
export const railConferences = (conferences: ConferenceSummary[]) => {
  const sorted = [...conferences].sort(
    (a, b) => Number(!a.covered) - Number(!b.covered)
  )
  return {
    sitting: sorted.filter(isSitting),
    past: sorted.filter(c => !isSitting(c))
  }
}

/** Whether the past conferences are listed at all, in their fold under the
 * ones still sitting (PastFold), in the rail and the picker's lists alike.
 * Off for now: only the conferences still sitting are listed, so none
 * enacted shows. */
export const SHOW_PAST_CONFERENCES = false

/** Whether the group of past conferences is open, and how the reader opens
 * or folds it. The page holds it (ConferenceDetails.tsx), so the rail and
 * the picker share it and it lasts between conferences. */
export type ClosedFold = {
  open: boolean
  onToggle: (open: boolean) => void
}

/** The past conferences, folded under the ones still sitting. */
const Closed = styled.details`
  margin-top: 0.75rem;

  > summary {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    /* In line with the rows' names (RailRow): their 3px edge and 1rem. */
    padding: 0.4375rem 0.5rem 0.4375rem calc(1rem + 3px);
    border-radius: 0 var(--maple-radius-md) var(--maple-radius-md) 0;
    font-size: 0.75rem;
    line-height: 1.35;
    color: var(--maple-text-muted);
    cursor: pointer;
    list-style: none;
    transition: background-color 120ms ease;

    &::-webkit-details-marker {
      display: none;
    }
    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    &:focus-visible {
      outline: 3px solid var(--maple-focus-ring);
      outline-offset: -3px;
    }
    .chevron {
      font-size: 0.625rem;
      transition: transform 150ms ease;
    }
  }
  &[open] > summary .chevron {
    transform: rotate(180deg);
  }
  > ul {
    margin-top: 2px;
  }
`

/** The fold the past conferences sit in, for the rail and the picker's
 * lists alike. */
export function PastFold({
  count,
  fold,
  children
}: {
  count: number
  fold: ClosedFold
  children: ReactNode
}) {
  const { t } = useTranslation("conferences")
  return (
    <Closed
      open={fold.open}
      onToggle={e => fold.onToggle(e.currentTarget.open)}
    >
      <summary>
        {t("rail_closed", { count })}
        <FontAwesomeIcon className="chevron" icon={faChevronDown} />
      </summary>
      {children}
    </Closed>
  )
}

/** Why the conferences we don't cover are listed but take no input: small,
 * italic and muted, in the body face, its left edge in line with the rail's
 * names (RailRow: their 3px edge and 1rem). The picker's lists set their own
 * sides (.uncovered-note, ConferencePicker.tsx). */
const NoteText = styled.p`
  margin: 0.875rem 0 0;
  padding: 0 0.75rem 0 calc(1rem + 3px);
  font-family: var(--maple-font-body);
  font-size: 0.75rem;
  font-style: italic;
  line-height: 1.5;
  color: var(--maple-text-muted);
`

/** Under a list of conferences, where any of them is one we don't cover
 * (the bond bills, "Not covered"). */
export function UncoveredNote({
  conferences
}: {
  conferences: ConferenceSummary[]
}) {
  const { t } = useTranslation("conferences")
  if (conferences.every(c => c.covered)) return null
  return <NoteText className="uncovered-note">{t("rail_not_covered")}</NoteText>
}

/** The conferences a list shows: those still sitting, and the past ones
 * where they are listed at all (SHOW_PAST_CONFERENCES). */
export const listedConferences = ({
  sitting,
  past
}: ReturnType<typeof railConferences>) =>
  SHOW_PAST_CONFERENCES ? [...sitting, ...past] : sitting

/** The rail's rows (railConferences): those still sitting, then the past
 * ones in their fold, then the note on those we don't cover. */
export function RailList({
  conferences,
  current,
  fold
}: {
  conferences: ConferenceSummary[]
  current: string
  fold: ClosedFold
}) {
  const listed = railConferences(conferences)
  const { sitting, past } = listed
  const rows = (cs: ConferenceSummary[]) => (
    <List>
      {cs.map(c => (
        <li key={c.id}>
          <RailRow
            href={maple.conference(c)}
            aria-current={c.id === current ? "page" : undefined}
            $on={c.id === current}
            $filed={c.status === "reportFiled"}
            $covered={c.covered}
          >
            <span className="name">{conferenceName(c)}</span>
            <span className="bills">
              <BillLine c={c} />
            </span>
          </RailRow>
        </li>
      ))}
    </List>
  )
  return (
    <>
      {rows(sitting)}
      {SHOW_PAST_CONFERENCES && past.length > 0 && (
        <PastFold count={past.length} fold={fold}>
          {rows(past)}
        </PastFold>
      )}
      <UncoveredNote conferences={listedConferences(listed)} />
    </>
  )
}
