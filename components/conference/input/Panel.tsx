import {
  CSSProperties,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { useMatches } from "../hooks"
import { FULL_LAYOUT, MOBILE_LAYOUT, PANEL_W } from "../styles"
import { Maximize2, Minimize2, X } from "./icons"
import { useLockedScroll } from "./useLockedScroll"
import { ink, line, wash } from "./tokens"

/** Where the panel is a sheet over the window rather than beside the page. */
const AS_SHEET = "(max-width: 1023.98px)"

/** Where what heads the window ends on screen now: the conference's beta note
 * (ConferenceBetaBanner.tsx), wherever the page's scroll has put it, else the
 * navbar, none once it has scrolled away. */
const headBottom = () => {
  const head =
    document.querySelector(".conference-beta-banner") ??
    document.querySelector(".main-navbar")
  return head ? Math.max(0, head.getBoundingClientRect().bottom) : 0
}

/** The panel's column beside the page from lg up (Row in
 * ConferenceDetails.tsx): the drawer's width while the panel stands beside
 * the page, opening and closing over 400ms as the page's padding did when
 * the panel stood over it, and none otherwise. It carries the panel in as it
 * opens, clipping it rather than hiding what overflows, which would stop the
 * panel pinning in it. Its edge runs the page's whole height, on under the
 * panel. */
const Slot = styled.div<{ $beside: boolean; $eases: boolean }>`
  /* The drawer's width (PANEL_W, styles.ts), the same at every window it
     stands beside the page in, and the form's column when the cosign fills
     the window. */
  --rail-w: ${PANEL_W}px;
  flex: none;
  width: 0;
  overflow: clip;

  @media (min-width: 1024px) {
    width: ${({ $beside }) => ($beside ? "var(--rail-w)" : "0px")};
    box-shadow: inset 1px 0 ${line.default};
    /* Easing only as the panel opens or closes (\`$eases\`); opened out to
       the window or folded back, the page makes its room at once. */
    transition: ${({ $eases }) => ($eases ? "width 400ms ease-out" : "none")};
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

/** Over the window, under what heads it (--panel-top), sliding in from the
 * right: the cosign's full window from lg up, and the sheet below lg. Beside
 * the page from lg up it is pinned in its column instead (Slot). */
const Aside = styled.aside<{
  $open: boolean
  $full: boolean
  $folding: boolean
  $swipe: boolean
}>`
  /* Nunito throughout, as the mockup sets the panel, over the site's Lexend
     body face (styles/bootstrap.scss); its title and the cosign card's name
     set Lexend themselves. */
  font-family: var(--maple-font-body);
  position: fixed;
  z-index: 40;
  right: 0;
  top: var(--panel-top, 0px);
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: var(--maple-surface-page);
  border-left: 1px solid ${line.default};
  transform: ${({ $open }) => ($open ? "none" : "translateX(100%)")};
  visibility: ${({ $open }) => ($open ? "visible" : "hidden")};
  transition: transform 400ms ease-out,
    visibility 0s linear ${({ $open }) => ($open ? "0s" : "400ms")};
  overflow: hidden;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  /* Beside the page from lg up: pinned in its column at the navbar's edge, as
     the page's rail and title are, and carried in by the column opening
     rather than sliding. It is as tall as the window less what is over the
     column at the page's top, so its buttons show there; once the navbar has
     scrolled away, that room is left under them. */
  ${({ $full, $open }) =>
    $full
      ? ""
      : `@media (min-width: 1024px) {
          position: sticky;
          top: var(--maple-navbar-height);
          bottom: auto;
          width: var(--rail-w);
          height: calc(100vh - var(--row-top, 0px));
          transform: none;
          /* Its column's opening is all the slide it has: no slide of its
             own, even coming from a window it was closed from. */
          transition: visibility 0s linear ${$open ? "0s" : "400ms"};
        }`}

  /* Filling the window, it covers the page rather than standing beside it. */
  ${({ $full }) => ($full ? `left: 0; z-index: 60; border-left: 0;` : "")}

  /* Folding back from the window to the drawer (\`$folding\`), from lg up,
     still over the page for the slide's 400ms, then taking its column. With
     something beside the form (\`$swipe\`, the cosign's letter): the form
     and the header already stand where the drawer does, at the right, so
     they stay, on the panel's ground there, and what is beside them swipes
     away to the right (Beside), the page showing through as it goes. With
     nothing beside it: its left edge eases from the window's to the
     drawer's. */
  ${({ $folding, $swipe }) =>
    !$folding
      ? ""
      : $swipe
      ? `@media (min-width: 1024px) {
          position: fixed;
          z-index: 60;
          top: var(--panel-top, 0px);
          right: 0;
          bottom: 0;
          left: 0;
          width: auto;
          height: auto;
          border-left: 0;
          transform: none;
          background: linear-gradient(
            to right,
            transparent calc(100% - var(--rail-w)),
            ${line.default} calc(100% - var(--rail-w)),
            ${line.default} calc(100% - var(--rail-w) + 1px),
            var(--maple-surface-page) calc(100% - var(--rail-w) + 1px)
          );
        }`
      : `@media (min-width: 1024px) {
          position: fixed;
          z-index: 60;
          top: var(--panel-top, 0px);
          right: 0;
          bottom: 0;
          left: calc(100% - var(--rail-w));
          width: auto;
          height: auto;
          border-left: 1px solid ${line.default};
          transform: none;
          transition: left 400ms ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          transition: none;
        }`}

  /* Below lg the panel is a sheet over the window, under what heads it, so
     the beta note shows over it as everywhere. */
  @media ${AS_SHEET} {
    left: 0;
    width: auto;
    z-index: 1045;
    border-left: 0;
  }
`

const Header = styled.header`
  display: flex;
  flex-shrink: 0;
  padding: 24px 18px 4px;
`

/** The title and its controls. Filling the window, they keep to the form's
 * column on the right, where they were before the panel opened out. */
const HeaderRow = styled.div<{ $full: boolean }>`
  display: flex;
  flex: 1;
  align-items: center;
  gap: 12px;

  @media ${FULL_LAYOUT} {
    ${({ $full }) =>
      $full
        ? `flex: none; margin-left: auto; width: calc(var(--rail-w) - 36px);`
        : ""}
  }
`

/** What is being read beside what is being written, the form in the drawer's
 * own column, down to the mobile layout (styles.ts); on mobile the one goes
 * above the other. */
const Split = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  @media ${FULL_LAYOUT} {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--rail-w);
    overflow: visible;
  }
`

/** The reading side, inset as the form insets itself: together the gap
 * between them is the mockup's 32px. On mobile, over the form, it takes the
 * room it needs, and the two scroll together; or it is not shown at all
 * (`$stacked` false). */
const Beside = styled.div<{ $stacked: boolean; $swiping: boolean }>`
  display: flex;
  flex: 1 1 0;
  min-height: 0;
  padding: 12px 18px 8px;

  @media ${MOBILE_LAYOUT} {
    ${({ $stacked }) => ($stacked ? "flex: none;" : "display: none;")}
  }
  @media ${FULL_LAYOUT} {
    padding: 12px 14px 22px 18px;
  }

  /* Folding back to the drawer (Aside's $swipe): what is read swipes out to
     the right, clipped at the form's edge so it never crosses the form or
     the header's controls, though it still rises into the header's band. */
  ${({ $swiping }) =>
    $swiping
      ? `overflow-x: clip;
        > * {
          transform: translateX(calc(100% + 40px));
          transition: transform 400ms ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          > * { transition: none; }
        }`
      : ""}
`

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 -6px 0 auto;
`

const Title = styled.p`
  margin: 0;
  font-family: var(--maple-font-heading);
  font-weight: 400;
  font-size: 1.25rem;
  line-height: 1.4;
  color: ${ink.strong};
`

const Close = styled.button`
  display: flex;
  padding: 6px;
  border: 0;
  border-radius: 8px;
  background: none;
  color: ${ink.mid};
  &:hover {
    color: ${ink.strong};
    background: ${wash.default};
  }
`

/** Filling the window or not, which means nothing in the sheet below lg: it
 * fills the window already, laid out as opened out from md (SHEET_SPREAD,
 * styles.ts), and stacked on mobile. */
const Toggle = styled(Close)`
  @media ${AS_SHEET} {
    display: none;
  }
`

/** The side panel the mockup files input in: in its own column beside the
 * page, pinned as the page scrolls, a sheet below lg. `full`, it fills the
 * window with what is to be read `beside` the form, and on mobile, where the
 * two stack, shows it only while `besideStacked`; `onFull` offers the reader
 * the choice from lg up. As a sheet it is always laid out as `full`. */
export function Panel({
  open,
  title,
  closeLabel,
  onClose,
  beside,
  besideStacked = true,
  full = false,
  onFull,
  children
}: {
  open: boolean
  title: string
  closeLabel: string
  onClose: () => void
  beside?: ReactNode
  besideStacked?: boolean
  full?: boolean
  onFull?: (full: boolean) => void
  children: ReactNode
}) {
  const { t } = useTranslation("conferences")

  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", key)
    return () => document.removeEventListener("keydown", key)
  }, [open, onClose])

  // Over the page, filling the window or as a sheet, the panel is the whole
  // surface: the page behind it should not scroll under a wheel over it. It
  // starts where what heads the window ends, which the locked page then holds
  // still.
  const sheet = useMatches(AS_SHEET)
  const covering = open && (full || sheet)
  useLockedScroll(covering)
  // Measured as it comes over the page, and kept after, so it keeps that top
  // as it slides away or folds back rather than jumping to the window's.
  const [top, setTop] = useState<number>()
  useEffect(() => {
    if (covering) setTop(headBottom())
  }, [covering])
  const toggle = t(full ? "input.leave_full" : "input.fill_window")

  // What changed last, for how the panel moves. Opening and closing ease the
  // column's width (Slot's $eases), the panel coming in beside the page and
  // going; opening out to the window or folding back to the drawer leave the
  // page to make its room at once. Folding back, the panel narrows to the
  // right over the page for the slide's 400ms (Aside's $folding), and only
  // then takes its column. Worked out as the change renders, so the column
  // and the panel take their way of moving in the same frame as the change.
  const [last, setLast] = useState({ open, full })
  const [eases, setEases] = useState(false)
  const [folding, setFolding] = useState(false)
  if (open !== last.open || full !== last.full) {
    setLast({ open, full })
    setEases(open !== last.open)
    // Only folding back while it stays open: opening in the drawer after
    // closing from the window is an opening, which slides in as one.
    setFolding(open && last.open && last.full && !full)
  }
  useEffect(() => {
    if (!folding) return
    const done = setTimeout(() => setFolding(false), 400)
    return () => clearTimeout(done)
  }, [folding])
  // While it folds back, laid out as it was across the window, so the letter
  // narrows away beside the form rather than leaving at once. As a sheet,
  // with no drawer to fold back to, always laid out across the window.
  const spread = full || folding || sheet

  // Where the column starts down the page, for the panel's height in it.
  // What is over the column changes the page's size when it changes.
  const slot = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = slot.current
    if (!el || typeof ResizeObserver === "undefined") return
    let published = ""
    const measure = () => {
      const value = `${el.getBoundingClientRect().top + window.scrollY}px`
      if (value === published) return
      published = value
      el.style.setProperty("--row-top", value)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [])

  return (
    <Slot ref={slot} $beside={open && !full} $eases={eases}>
      <Aside
        $open={open}
        $full={full}
        $folding={folding}
        $swipe={!!beside}
        style={
          (top !== undefined
            ? { "--panel-top": `${top}px` }
            : {}) as CSSProperties
        }
        aria-label={title}
        aria-hidden={!open}
      >
        <Header>
          <HeaderRow $full={spread && !!beside}>
            <Title>{title}</Title>
            <Controls>
              {onFull && (
                <Toggle
                  type="button"
                  onClick={() => onFull(!full)}
                  aria-label={toggle}
                  title={toggle}
                >
                  {full ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                </Toggle>
              )}
              <Close type="button" onClick={onClose} aria-label={closeLabel}>
                <X size={18} />
              </Close>
            </Controls>
          </HeaderRow>
        </Header>
        {/* Filling the window with something to read beside the form (the
            cosign's letter); with nothing beside it, the form lays itself
            out across the window (InputForm's Parts). */}
        {spread && beside ? (
          <Split>
            <Beside $stacked={besideStacked} $swiping={folding}>
              {beside}
            </Beside>
            {children}
          </Split>
        ) : (
          children
        )}
      </Aside>
    </Slot>
  )
}
