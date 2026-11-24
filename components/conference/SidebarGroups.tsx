import { Fragment, useLayoutEffect, useRef, useState } from "react"
import { useTranslation } from "next-i18next"
import Router from "next/router"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { formatBillId } from "../formatting"
import { Internal, maple } from "../links"
import { Bills, CATEGORIES, Category, categoryOf } from "./categories"
import { recess, wash } from "./input/tokens"
import { BESIDE, RAIL_COMPACT, RAIL_COMPACT_BESIDE } from "./styles"
import { byName, conferenceName, ConferenceSummary } from "./types"

type SidebarGroupSettings = {
  data: Category
  display: "inline" | "grouped"
  shown: boolean
}

/** The sidebar's groups, top to bottom. Each shows one category. Groups that
 * are off or empty don't show. */
export const SIDEBAR_GROUPS: SidebarGroupSettings[] = [
  { data: "active", display: "inline", shown: true },
  { data: "notCovered", display: "grouped", shown: true },
  { data: "pending", display: "grouped", shown: false },
  { data: "enacted", display: "grouped", shown: false },
  { data: "failed", display: "grouped", shown: false },
  { data: "dissolved", display: "grouped", shown: false }
]

/** The line between rows. */
const DIVIDER = "rgba(15, 23, 42, 0.08)"

/** The current conference's right line, a step darker. */
const SELECTED_LINE = "rgba(15, 23, 42, 0.16)"

/** How long a section takes to slide open or shut. */
const SLIDE_MS = 250

/** Whether the user prefers less motion, so sections don't slide. */
const still = () =>
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)

/** The sidebar's shared spacing. Text starts at the inset: the 3px bar plus
 * 16px, or plus 10px in the compact sidebar. */
const Root = styled.div`
  --sidebar-inset: 19px;
  --sidebar-right: 12px;

  @media ${RAIL_COMPACT} {
    --sidebar-inset: 13px;
    --sidebar-right: 8px;
  }
  @media ${RAIL_COMPACT_BESIDE} {
    ${BESIDE} & {
      --sidebar-inset: 13px;
      --sidebar-right: 8px;
    }
  }
`

/** A list of sidebar rows, with a light line between each. The main list also
 * has a line above and below it. */
const List = styled.ul<{ $edges: boolean }>`
  list-style: none;
  margin: 0;
  padding: 0;
  ${({ $edges }) => ($edges ? `border-block: 1px solid ${DIVIDER};` : "")}

  li + li {
    border-top: 1px solid ${DIVIDER};
  }
`

/** One row's link. Regular rows are in the main list, small rows are in
 * sections, and the compact sidebar makes both a little tighter. */
const RowLink = styled(Internal)<{
  $size: "regular" | "small"
  $muted: boolean
}>`
  --row-padding: ${({ $size }) => ($size === "small" ? "7px" : "11px")};
  --name-size: ${({ $size }) => ($size === "small" ? "13px" : "14px")};
  --bills-size: ${({ $size }) => ($size === "small" ? "11px" : "12px")};

  @media ${RAIL_COMPACT} {
    --row-padding: 6px;
    --name-size: 13px;
  }
  @media ${RAIL_COMPACT_BESIDE} {
    ${BESIDE} & {
      --row-padding: 6px;
      --name-size: 13px;
    }
  }

  display: block;
  padding: var(--row-padding) var(--sidebar-right) var(--row-padding)
    var(--sidebar-inset);
  border-right: 1px solid transparent;
  /* The background stops inside the border, so the right line sits on the
     page's grey, not on the row's own white. */
  background-clip: padding-box;
  text-decoration: none;
  transition: background-color 120ms ease;

  &:hover {
    background: ${wash.default};
  }
  /* The current conference: white, with the bar on the left and a darker
     line on the right. The bar is an inset shadow, so it has square ends. */
  &[aria-current="page"] {
    box-shadow: inset 3px 0 0 var(--maple-brand-primary);
    border-right-color: ${SELECTED_LINE};
    background: var(--maple-surface-base);
  }

  .name {
    display: block;
    font-size: var(--name-size);
    line-height: 1.35;
    font-weight: 300;
    color: ${({ $muted }) =>
      $muted ? "var(--maple-text-muted)" : "var(--maple-text-strong)"};
  }
  &[aria-current="page"] .name {
    font-weight: 600;
    color: ${({ $muted }) =>
      $muted ? "var(--maple-text-muted)" : "var(--maple-brand-primary)"};
  }
  .bills {
    display: block;
    margin-top: 1px;
    font-size: var(--bills-size);
    line-height: 1.35;
    color: var(--maple-text-muted);
  }
  .report {
    margin-left: 8px;
    font-size: var(--bills-size);
    font-weight: 400;
    color: var(--maple-text-muted);
    white-space: nowrap;
  }
`

/** When the user clicks a new item in the sidebar, the new page scrolls to
 * just below the header (ConferenceRail.tsx). Reloads and direct links still
 * open at the top of the page. */
let followed = false

/** Tells the new page whether the user got there by clicking a sidebar item,
 * then resets, so it only counts once. */
export const followedFromSidebar = () => {
  const was = followed
  followed = false
  return was
}

/** When a sidebar item leads to a page without the sidebar, like a 404, this
 * takes the user to the top of that page instead of leaving it scrolled
 * down. */
const landed = () => {
  Router.events.off("routeChangeComplete", landed)
  if (!followed) return
  followed = false
  window.scrollTo(0, 0)
}

/** One conference in the sidebar: its name, linked, with its bill numbers.
 * The current conference has a bar and a bold name. */
function SidebarRow({
  c,
  current,
  bills,
  size
}: {
  c: ConferenceSummary
  current: string
  bills: Bills
  size: "regular" | "small"
}) {
  return (
    <li>
      <RowLink
        href={maple.conference(c)}
        scroll={false}
        onClick={e => {
          const plain = !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
          if (c.id !== current && e.button === 0 && plain) {
            followed = true
            Router.events.on("routeChangeComplete", landed)
          }
        }}
        aria-current={c.id === current ? "page" : undefined}
        $size={size}
        $muted={!c.covered}
      >
        {bills === "report" && c.reportBillId ? (
          <span className="name">
            {conferenceName(c)}
            <span className="report">{formatBillId(c.reportBillId)}</span>
          </span>
        ) : (
          <>
            <span className="name">{conferenceName(c)}</span>
            <span className="bills">
              {formatBillId(c.senateBillId)} · {formatBillId(c.houseBillId)}
            </span>
          </>
        )}
      </RowLink>
    </li>
  )
}

/** A grouped section: a header button over its rows, on a grey panel while
 * open or while it holds the current conference. */
const Panel = styled.div`
  margin-top: 12px;
  border-radius: var(--maple-radius-xl);
  overflow: hidden;
  transition: background-color ${SLIDE_MS}ms ease;

  &[data-state="open"],
  &[data-current] {
    background: ${recess};
  }
`

/** A section's header: its category and count, with "1 selected" while it's
 * collapsed on the current conference, and a chevron that flips when open. */
const Header = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
  padding: 10px var(--sidebar-right) 10px var(--sidebar-inset);
  border: 0;
  background: none;
  font: inherit;
  font-size: 12px;
  line-height: 1.35;
  text-align: left;
  color: var(--maple-text-body);
  cursor: pointer;
  transition: background-color 120ms ease;

  &:hover {
    background: ${wash.default};
  }
  &:focus-visible {
    outline: 3px solid var(--maple-focus-ring);
    outline-offset: -3px;
  }
  .end {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .selected {
    font-weight: 300;
    color: var(--maple-text-muted);
  }
  .chevron {
    font-size: 10px;
    transition: transform 150ms ease;
  }
  &[aria-expanded="true"] .chevron {
    transform: rotate(180deg);
  }
`

/** The section's rows, which slide. */
const Body = styled.div`
  overflow: hidden;
`

/** The sidebar's display for one grouped category: a collapsible section
 * with the category's name and count. Collapsed, it still shows the current
 * conference if it's in the group. */
function SidebarSection({
  category,
  conferences,
  current,
  open,
  onToggle
}: {
  category: Category
  conferences: ConferenceSummary[]
  current: string
  open: boolean
  onToggle: (category: Category, open: boolean) => void
}) {
  const { t } = useTranslation("conferences")
  const body = useRef<HTMLDivElement>(null)
  // When the user clicks a section open, this is the height it slides open
  // from. A section that's already open when the page loads doesn't slide.
  const from = useRef<number | null>(null)
  const closing = useRef<Animation | null>(null)
  const [shutting, setShutting] = useState(false)
  const here = conferences.find(c => c.id === current)
  const expanded = open && !shutting
  const rows = open ? conferences : here ? [here] : []

  // Slides open after the rows render, and drops the closing slide once the
  // section has closed, before it's painted.
  useLayoutEffect(() => {
    const el = body.current
    if (!el) return
    if (open && from.current !== null) {
      el.animate?.(
        { height: [`${from.current}px`, `${el.scrollHeight}px`] },
        { duration: still() ? 0 : SLIDE_MS, easing: "ease" }
      )
      from.current = null
    }
    if (!open && closing.current) {
      closing.current.cancel()
      closing.current = null
      setShutting(false)
    }
  }, [open])

  // Closing slides down to the current conference's row, which stays, or to
  // nothing, and only then closes.
  const toggle = () => {
    const el = body.current
    if (!open) {
      from.current = el?.offsetHeight ?? 0
      onToggle(category, true)
      return
    }
    const row = el?.querySelector('[aria-current="page"]')?.closest("li")
    const to =
      el && row
        ? row.getBoundingClientRect().bottom - el.getBoundingClientRect().top
        : 0
    const slide = el?.animate?.(
      { height: [`${el.offsetHeight}px`, `${to}px`] },
      { duration: still() ? 0 : SLIDE_MS, easing: "ease", fill: "forwards" }
    )
    if (!slide) return onToggle(category, false)
    closing.current = slide
    setShutting(true)
    slide.finished.then(
      () => onToggle(category, false),
      () => {}
    )
  }

  return (
    <Panel
      data-section=""
      data-state={expanded ? "open" : shutting ? "closing" : "closed"}
      data-current={here ? "" : undefined}
    >
      <Header type="button" aria-expanded={expanded} onClick={toggle}>
        <span>
          {t(`category.${category}`)}{" "}
          <span className="count">({conferences.length})</span>
        </span>
        <span className="end">
          {here && !expanded && (
            <span className="selected">{t("rail_selected")}</span>
          )}
          <FontAwesomeIcon className="chevron" icon={faChevronDown} />
        </span>
      </Header>
      <Body ref={body}>
        {rows.length > 0 && (
          <List $edges={false}>
            {rows.map(c => (
              <SidebarRow
                key={c.id}
                c={c}
                current={current}
                bills={CATEGORIES[category].bills}
                size="small"
              />
            ))}
          </List>
        )}
      </Body>
    </Panel>
  )
}

/** Why the conferences we don't cover are listed but take no input. */
const Note = styled.p`
  margin: 12px 0 0;
  padding: 0 var(--sidebar-right) 0 var(--sidebar-inset);
  font-family: var(--maple-font-body);
  font-size: 12px;
  font-style: italic;
  font-weight: 300;
  line-height: 1.5;
  color: var(--maple-text-muted);
`

/** The section the user opened. Kept as they move between conferences,
 * until they close it or the page reloads. */
let remembered: Category | null = null

/** The sidebar's list of conferences. It shows each group in SIDEBAR_GROUPS
 * that's turned on and has conferences, with items sorted by name. Opening a
 * section closes any other. */
export function SidebarGroups({
  conferences,
  current
}: {
  conferences: ConferenceSummary[]
  current: string
}) {
  const { t } = useTranslation("conferences")
  const groups = SIDEBAR_GROUPS.filter(g => g.shown)
    .map(g => ({
      ...g,
      conferences: conferences
        .filter(c => categoryOf(c) === g.data)
        .sort(byName)
    }))
    .filter(g => g.conferences.length > 0)
  const [open, setOpen] = useState(remembered)
  const toggle = (category: Category, isOpen: boolean) =>
    setOpen(was => {
      const next = isOpen ? category : was === category ? null : was
      remembered = next
      return next
    })

  return (
    <Root>
      {groups.map(g => (
        <Fragment key={g.data}>
          {g.display === "inline" ? (
            <List $edges>
              {g.conferences.map(c => (
                <SidebarRow
                  key={c.id}
                  c={c}
                  current={current}
                  bills={CATEGORIES[g.data].bills}
                  size="regular"
                />
              ))}
            </List>
          ) : (
            <SidebarSection
              category={g.data}
              conferences={g.conferences}
              current={current}
              open={open === g.data}
              onToggle={toggle}
            />
          )}
          {g.data === "notCovered" && <Note>{t("rail_not_covered")}</Note>}
        </Fragment>
      ))}
    </Root>
  )
}
