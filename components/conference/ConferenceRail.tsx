import { Dispatch, ReactNode, SetStateAction, useEffect, useRef } from "react"
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
  /* A touch lighter than the muted grey (#64748b), 10% of the way to
     white. */
  .bills {
    display: block;
    margin-top: 1px;
    font-size: 0.75rem;
    line-height: 1.35;
    color: #738297;
  }
  .status {
    margin-left: 0.375rem;
    font-style: italic;
  }
  /* "Not covered", one weight lighter than the rest of the line. */
  .uncovered {
    font-weight: 300;
  }
  /* A past conference's new bill number, on the same line as its name,
     styled like .bills. */
  .after {
    margin-left: 0.5rem;
    font-size: 0.75rem;
    font-weight: 400;
    color: #738297;
    white-space: nowrap;
  }
`

/** "S.1234 · H.5678", the status once the conference has finished, and a
 * label where we haven't covered it. The caller styles `.status`, and
 * `.uncovered` for the "Not covered" label. */
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
        <span className="status uncovered">{t("not_covered")}</span>
      )}
    </>
  )
}

/** One conference's text in the rail and the picker's lists. Still sitting:
 * its name, with its two bill numbers under it, and "Not covered" when
 * FOLD_UNCOVERED is off. Past: its name, with its new bill number beside it
 * ("H.5350"); the group heading shows its status. The caller styles
 * `.name`, `.bills`, `.after`, `.status` and `.uncovered`. */
export function RowText({ c }: { c: ConferenceSummary }) {
  if (isSitting(c))
    return (
      <>
        <span className="name">{conferenceName(c)}</span>
        <span className="bills">
          <BillLine c={c} noteUncovered={!FOLD_UNCOVERED} />
        </span>
      </>
    )
  return (
    <span className="name">
      {conferenceName(c)}
      {c.reportBillId && (
        <span className="after">{formatBillId(c.reportBillId)}</span>
      )}
    </span>
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

/** The collapsible groups below the main list, in order: "Not covered"
 * (still sitting, but not covered), then the past ones by status, in the
 * order they happen: "Report filed", "Enacted", "Dissolved". */
export const RAIL_GROUPS = [
  "uncovered",
  "reportFiled",
  "enacted",
  "dissolved"
] as const
export type RailGroup = (typeof RAIL_GROUPS)[number]

/** Whether past conferences are listed, in their groups below the main list,
 * in the rail and the picker alike. Off for now, so no enacted conference
 * shows. Not covered conferences are still sitting, so they're listed either
 * way. */
export const SHOW_PAST_CONFERENCES = false

/** Whether not covered conferences get their own collapsible group ("Not
 * covered"), or stay at the bottom of the main list, each marked "Not
 * covered". Off for now: at the bottom. */
export const FOLD_UNCOVERED = false

/** The group a conference goes in, if any: a past one, by its status; a
 * sitting one, none, unless it's not covered and FOLD_UNCOVERED is on. */
export function groupOf(
  c: Pick<ConferenceSummary, "status" | "covered">
): RailGroup | null {
  if (c.status !== "appointed") return c.status
  return !c.covered && FOLD_UNCOVERED ? "uncovered" : null
}

/** What the rail and the picker (ConferencePicker.tsx) list: the sitting
 * conferences, not covered ones last; then each group that has any, in
 * RAIL_GROUPS order. */
export const railConferences = (conferences: ConferenceSummary[]) => ({
  sitting: conferences
    .filter(c => groupOf(c) === null)
    .sort((a, b) => Number(!a.covered) - Number(!b.covered)),
  groups: RAIL_GROUPS.filter(g =>
    g === "uncovered" ? FOLD_UNCOVERED : SHOW_PAST_CONFERENCES
  )
    .map(group => ({
      group,
      conferences: conferences.filter(c => groupOf(c) === group)
    }))
    .filter(g => g.conferences.length > 0)
})

/** Which group is open (one at most), and how to open or close one. The page
 * holds it (ConferenceDetails.tsx), so the rail and the picker share it and
 * it carries over between conferences. */
export type ClosedFold = {
  open: RailGroup | null
  onToggle: (group: RailGroup, open: boolean) => void
}

/** ClosedFold's onToggle, keeping one group open at a time. Opening a group
 * closes the one that was open. The browser then reports that one closing,
 * which must not close the new one. */
export const oneOpen =
  (set: Dispatch<SetStateAction<RailGroup | null>>) =>
  (group: RailGroup, open: boolean) =>
    set(was => (open ? group : was === group ? null : was))

/** One collapsible group, below the main list. */
const Closed = styled.details`
  /* The group's heading: full width, chevron at the right, and the whole
     area between its lines clickable, like a row. */
  > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.375rem;
    /* Lined up with the rows' names (RailRow's 3px edge and 1rem); 22px
       above and below. */
    padding: 22px 0.5rem 22px calc(1rem + 3px);
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
  /* Inside a group, lines only between rows: none above the first or below
     the last. */
  > ul li:first-child {
    border-top: 0;
  }
  > ul li:last-child {
    border-bottom: 0;
  }
  /* A line between one group and the next. */
  & + & {
    border-top: 1px solid ${RULE};
  }
`

/** One collapsible group, headed by its name ("Not covered", "Enacted"), in
 * the rail and the picker alike. */
export function GroupFold({
  group,
  fold,
  children
}: {
  group: RailGroup
  fold: ClosedFold
  children: ReactNode
}) {
  const { t } = useTranslation("conferences")
  return (
    <Closed
      open={fold.open === group}
      onToggle={e => fold.onToggle(group, e.currentTarget.open)}
    >
      <summary>
        {t(group === "uncovered" ? "not_covered" : `status.${group}`)}
        <FontAwesomeIcon className="chevron" icon={faChevronDown} />
      </summary>
      {children}
    </Closed>
  )
}

/** The rail's list: the sitting conferences, then each group
 * (railConferences). */
export function RailList({
  conferences,
  current,
  fold
}: {
  conferences: ConferenceSummary[]
  current: string
  fold: ClosedFold
}) {
  const { sitting, groups } = railConferences(conferences)
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
            <RowText c={c} />
          </RailRow>
        </li>
      ))}
    </List>
  )
  return (
    <>
      {rows(sitting)}
      {groups.map(({ group, conferences: cs }) => (
        <GroupFold key={group} group={group} fold={fold}>
          {rows(cs)}
        </GroupFold>
      ))}
    </>
  )
}
