import { RefObject, useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Offcanvas } from "../bootstrap"
import { Internal, maple } from "../links"
import { BillLine, railConferences } from "./ConferenceRail"
import { useMatches, useRailHidden } from "./hooks"
import { List } from "./input/icons"
import { PHONE_GUTTER, SHEET } from "./styles"
import { conferenceName, ConferenceSummary } from "./types"

/** The way to the other conferences on mobile, where the rail is gone: a
 * white round button with a bulleted list, floating at the bottom left
 * opposite the way to share input (FabDock in ConferenceDetails.tsx), 56px,
 * with a soft shadow so it reads over the page under it. */
const Toggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  padding: 0;
  border: 1px solid var(--maple-surface-border);
  border-radius: 9999px;
  background: var(--maple-surface-base);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  color: var(--maple-brand-primary-strong);
  cursor: pointer;
  transition: background-color 120ms ease;

  &:hover {
    background: #f0f2f8;
  }
  &:focus-visible {
    outline: 3px solid var(--maple-focus-ring);
    outline-offset: 3px;
  }
`

/** The drawer's heading in Lexend, light. */
const DrawerTitle = styled(Offcanvas.Title)`
  && {
    font-family: var(--maple-font-heading);
    font-weight: 300;
  }
`

/** The drawer's list, its rows run out to the drawer's edges (over the
 * body's own sides), with a faint rule between them. */
const DrawerBody = styled(Offcanvas.Body)`
  && {
    padding-left: 0;
    padding-right: 0;
    font-family: var(--maple-font-heading);
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li + li {
    border-top: 1px solid rgba(15, 23, 42, 0.06);
  }
`

/** A row made for a thumb, as the rail's (ConferenceRail.tsx) but larger:
 * the screen's width, the one being read marked by the rail's bar at the
 * screen's edge and a grey wash, the names at 16px and the bills at 13px,
 * each row about 64px tall, its words in line with the page's edge.
 * Dimmed and muted as the rail's rows are. */
const Row = styled(Internal)<{
  $on: boolean
  $filed: boolean
  $covered: boolean
}>`
  display: block;
  border-left: 3px solid
    ${({ $on }) => ($on ? "var(--maple-brand-primary)" : "transparent")};
  padding: 14px ${PHONE_GUTTER} 14px calc(${PHONE_GUTTER} - 3px);
  background: ${({ $on }) => ($on ? "rgba(0, 0, 0, 0.05)" : "none")};
  text-decoration: none;
  transition: background-color 120ms ease;
  opacity: ${({ $on, $filed }) => ($filed && !$on ? 0.5 : 1)};

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  &:focus-visible {
    outline: 3px solid var(--maple-focus-ring);
    outline-offset: -3px;
  }

  .name {
    display: block;
    font-size: 1rem;
    line-height: 1.35;
    font-weight: ${({ $on }) => ($on ? 600 : 400)};
    color: ${({ $on, $covered }) =>
      !$covered
        ? "var(--maple-text-muted)"
        : $on
        ? "var(--maple-brand-primary)"
        : "var(--maple-text-strong)"};
  }
  .bills {
    display: block;
    margin-top: 2px;
    font-size: 0.8125rem;
    line-height: 1.35;
    color: var(--maple-text-muted);
  }
  .status {
    margin-left: 0.375rem;
    font-style: italic;
  }
`

/** The drawer risen from the screen's foot (ConferenceDrawer's bottom):
 * nearly all the way up, nine tenths of the screen, a sliver of the page
 * left over it, its top corners rounded as a sheet's. */
const Drawer = styled(Offcanvas)`
  &&.offcanvas-bottom {
    --bs-offcanvas-height: 90vh;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }
`

/**
 * The rail's conferences in a sheet that rises from the screen's foot: a
 * light heading and a close, and the rows made for a thumb, `current` marked
 * where there is one. Following a row puts it away.
 */
export function ConferenceDrawer({
  conferences,
  current,
  show,
  onHide
}: {
  conferences: ConferenceSummary[]
  current?: string
  show: boolean
  onHide: () => void
}) {
  const { t } = useTranslation("conferences")
  return (
    <Drawer show={show} onHide={onHide} placement="bottom">
      <Offcanvas.Header closeButton>
        <DrawerTitle>{t("index_title")}</DrawerTitle>
      </Offcanvas.Header>
      <DrawerBody aria-label={t("in_conference")}>
        <ul>
          {railConferences(conferences).map(c => (
            <li key={c.id}>
              <Row
                href={maple.conference(c)}
                aria-current={c.id === current ? "page" : undefined}
                $on={c.id === current}
                $filed={c.status === "reportFiled"}
                $covered={c.covered}
                onClick={onHide}
              >
                <span className="name">{conferenceName(c)}</span>
                <span className="bills">
                  <BillLine c={c} />
                </span>
              </Row>
            </li>
          ))}
        </ul>
      </DrawerBody>
    </Drawer>
  )
}

/** From the sheet's width up to the rail's (576px to 767px, SHEET and
 * RAIL_FROM in styles.ts), the list as a popover over the button rather than
 * the sheet: a card rising from the
 * button's corner, as the mockup's menus are (its line, 16px corners and
 * deep, soft shadow), no wider than the screen leaves 20px either side of,
 * no taller than about three fifths of it, scrolling inside itself without
 * the page behind it taking the scroll over. Hung off the body and placed by
 * hand, over the navbar (1020, sticky-top) and under Bootstrap's dialogs
 * (1050 and up). */
const Popover = styled.nav`
  position: fixed;
  z-index: 1035;
  width: min(360px, calc(100vw - 40px));
  max-height: min(60vh, 32rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 6px 0;
  background: var(--maple-surface-base);
  border: 1px solid rgba(0, 0, 0, 0.16);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(20, 20, 19, 0.1), 0 1px 3px rgba(20, 20, 19, 0.06);
  font-family: var(--maple-font-heading);

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li + li {
    border-top: 1px solid rgba(15, 23, 42, 0.06);
  }

  /* Rows a size down from the drawer's thumb-sized ones (Row): the names
     alone at 14px, as the rail's are (ConferenceRail.tsx), without the bills
     under them, 12px above and below, so more of them fit in view. A
     conference we don't cover keeps its muted name. */
  && a {
    padding: 12px 1rem 12px calc(1rem - 3px);
  }
  && .name {
    font-size: 0.875rem;
  }
  && .bills {
    display: none;
  }
`

/**
 * The rail's conferences in a popover over `anchor` (Popover), its foot 12px
 * over the anchor's top and its left, or with `align` "end" its right, in
 * line with the anchor's; measured again as the page scrolls or the window
 * changes. Put away by a press outside it or on a row, or Escape, which puts
 * the reader back on the anchor. Once drawn, the one being read takes the
 * focus, as the popover hangs off the end of the page where the keyboard
 * would not reach it from the anchor. Shown while it is rendered.
 */
export function ConferencePopover({
  conferences,
  current,
  anchor,
  onClose,
  align = "start"
}: {
  conferences: ConferenceSummary[]
  current?: string
  anchor: RefObject<HTMLElement | null>
  onClose: () => void
  align?: "start" | "end"
}) {
  const { t } = useTranslation("conferences")
  const popover = useRef<HTMLElement>(null)
  const [at, setAt] = useState<{
    left?: number
    right?: number
    bottom: number
  } | null>(null)

  useEffect(() => {
    const place = () => {
      const r = anchor.current?.getBoundingClientRect()
      if (!r) return
      const bottom = window.innerHeight - r.top + 12
      setAt(
        align === "end"
          ? { right: window.innerWidth - r.right, bottom }
          : { left: r.left, bottom }
      )
    }
    place()
    const away = (e: PointerEvent) => {
      const target = e.target as Node
      if (
        !anchor.current?.contains(target) &&
        !popover.current?.contains(target)
      )
        onClose()
    }
    const escape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      onClose()
      anchor.current?.focus()
    }
    window.addEventListener("scroll", place, true)
    window.addEventListener("resize", place)
    window.addEventListener("pointerdown", away)
    window.addEventListener("keydown", escape)
    return () => {
      window.removeEventListener("scroll", place, true)
      window.removeEventListener("resize", place)
      window.removeEventListener("pointerdown", away)
      window.removeEventListener("keydown", escape)
    }
  }, [anchor, align, onClose])

  // Focus the one being read once, when first placed, not each time it
  // follows the anchor.
  const focused = useRef(false)
  useEffect(() => {
    if (!at || focused.current) return
    focused.current = true
    const list = popover.current
    const current = list?.querySelector<HTMLElement>('[aria-current="page"]')
    const first = list?.querySelector<HTMLElement>("a")
    const target = current ?? first
    target?.focus()
  }, [at])

  if (!at) return null
  return createPortal(
    <Popover ref={popover} aria-label={t("in_conference")} style={at}>
      <ul>
        {railConferences(conferences).map(c => (
          <li key={c.id}>
            <Row
              href={maple.conference(c)}
              aria-current={c.id === current ? "page" : undefined}
              $on={c.id === current}
              $filed={c.status === "reportFiled"}
              $covered={c.covered}
              onClick={onClose}
            >
              <span className="name">{conferenceName(c)}</span>
              <span className="bills">
                <BillLine c={c} />
              </span>
            </Row>
          </li>
        ))}
      </ul>
    </Popover>,
    document.body
  )
}

/**
 * Where the rail is gone, the way to the other conferences: a floating
 * button that opens the rail's conferences, the one being read marked.
 * Below 576px, in a sheet rising from the screen's foot (ConferenceDrawer,
 * SHEET in styles.ts), as the Conference Committees page's button does;
 * wider, in a popover over the button (ConferencePopover).
 */
export function ConferenceSwitcher({
  conferences,
  current
}: {
  conferences: ConferenceSummary[]
  current: ConferenceSummary
}) {
  const { t } = useTranslation("conferences")
  const [open, setOpen] = useState(false)
  // The drawer is added to the page the first time it is opened, and kept
  // after, so it can slide away again.
  const [seen, setSeen] = useState(false)
  const railHidden = useRailHidden()
  const sheet = useMatches(SHEET)
  const button = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => setOpen(false), [])

  // Put away once another conference is open, and once the window is wide
  // enough for the rail.
  useEffect(() => setOpen(false), [current.id])
  useEffect(() => {
    if (!railHidden) setOpen(false)
  }, [railHidden])

  return (
    <>
      <Toggle
        ref={button}
        type="button"
        aria-label={t("pick_conference")}
        aria-expanded={open}
        onClick={() => {
          if (sheet) setSeen(true)
          setOpen(v => !v)
        }}
      >
        <List size={26} strokeWidth={2} />
      </Toggle>
      {seen && (
        <ConferenceDrawer
          conferences={conferences}
          current={current.id}
          show={open && sheet}
          onHide={close}
        />
      )}
      {open && !sheet && (
        <ConferencePopover
          conferences={conferences}
          current={current.id}
          anchor={button}
          onClose={close}
        />
      )}
    </>
  )
}
