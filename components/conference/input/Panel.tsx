import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useState
} from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { navbarBottom } from "../navbar"
import { Maximize2, Minimize2, X } from "./icons"
import { useLockedScroll } from "./useLockedScroll"
import { ink, line, wash } from "./tokens"

/** The panel's resting width: a third of the window, held between 400 and 520. */
const DRAWER_MIN = 400
const DRAWER_VW = 0.34
const DRAWER_MAX = 520
/** The most a drag may take, and the room the page keeps. */
const RAIL_MAX_SHARE = 0.48
const PAGE_MIN = 236 + 64 + 64 + 390

const resting = () =>
  Math.min(Math.max(DRAWER_MIN, DRAWER_VW * window.innerWidth), DRAWER_MAX)

/** How wide the panel is drawn, which the page also needs so it can step aside.
 * `drag` takes a pointer position; `null` is not dragged. */
export function usePanelWidth() {
  const [width, setWidth] = useState(DRAWER_MIN)
  const [dragged, setDragged] = useState<number | null>(null)

  useEffect(() => {
    const read = () => setWidth(resting())
    read()
    window.addEventListener("resize", read)
    return () => window.removeEventListener("resize", read)
  }, [])

  const drag = useCallback((px: number) => {
    const ceiling = Math.max(
      resting(),
      Math.min(RAIL_MAX_SHARE * window.innerWidth, window.innerWidth - PAGE_MIN)
    )
    setDragged(Math.round(Math.min(Math.max(px, resting()), ceiling)))
  }, [])

  return { width: dragged ?? width, drag }
}

const Aside = styled.aside<{ $open: boolean; $full: boolean }>`
  position: fixed;
  z-index: 40;
  right: 0;
  top: var(--panel-top, var(--maple-navbar-height));
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

  /* Its width is the drawer's from lg up; filling the window, it covers the
     page rather than standing beside it. */
  @media (min-width: 1024px) {
    width: ${({ $full }) => ($full ? "auto" : "var(--rail-w)")};
  }
  ${({ $full }) => ($full ? `left: 0; z-index: 60; border-left: 0;` : "")}

  /* Below lg the panel is a sheet over the whole window. */
  @media (max-width: 1023.98px) {
    top: 0;
    left: 0;
    width: auto;
    z-index: 1045;
    border-left: 0;
  }
`

const Edge = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  width: 6px;
  margin-left: -3px;
  cursor: col-resize;

  @media (max-width: 1023.98px) {
    display: none;
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

  @media (min-width: 1024px) {
    ${({ $full }) =>
      $full
        ? `flex: none; margin-left: auto; width: calc(var(--rail-w) - 36px);`
        : ""}
  }
`

/** What is being read beside what is being written, where there is room for
 * both, the form in the drawer's own column; below lg the one goes above the
 * other. */
const Split = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--rail-w);
    overflow: visible;
  }
`

/** The reading side, inset as the form insets itself: together the gap
 * between them is the mockup's 32px. */
const Beside = styled.div`
  display: flex;
  flex: 1 1 0;
  min-height: 0;
  padding: 12px 18px 8px;

  @media (min-width: 1024px) {
    padding: 12px 14px 22px 18px;
  }
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

/** The side panel the mockup files input in: under the navigation on the
 * right, a sheet below lg, its left edge draggable. `full`, it fills the
 * window with what is to be read `beside` the form; `onFull` offers the
 * reader the choice. */
export function Panel({
  open,
  title,
  closeLabel,
  width,
  onDrag,
  onClose,
  beside,
  full = false,
  onFull,
  children
}: {
  open: boolean
  title: string
  closeLabel: string
  width: number
  onDrag: (px: number) => void
  onClose: () => void
  beside?: ReactNode
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

  // Filling the window, the panel is the whole surface: the page behind it
  // should not scroll under a wheel over the letter. It starts where the
  // navbar ends, which the locked page then holds still.
  const filled = open && full
  useLockedScroll(filled)
  const [top, setTop] = useState<number>()
  useEffect(() => setTop(filled ? navbarBottom() : undefined), [filled])
  const toggle = t(full ? "input.leave_full" : "input.fill_window")

  return (
    <Aside
      $open={open}
      $full={full}
      style={
        {
          "--rail-w": `${width}px`,
          ...(top !== undefined && { "--panel-top": `${top}px` })
        } as CSSProperties
      }
      aria-label={title}
      aria-hidden={!open}
    >
      <Edge
        onPointerDown={e => {
          e.currentTarget.setPointerCapture(e.pointerId)
          e.preventDefault()
          onDrag(window.innerWidth - e.clientX)
        }}
        onPointerMove={e => {
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            onDrag(window.innerWidth - e.clientX)
        }}
        onPointerUp={e => e.currentTarget.releasePointerCapture(e.pointerId)}
        onPointerCancel={e =>
          e.currentTarget.releasePointerCapture(e.pointerId)
        }
      />
      <Header>
        <HeaderRow $full={full}>
          <Title>{title}</Title>
          <Controls>
            {onFull && (
              <Close
                type="button"
                onClick={() => onFull(!full)}
                aria-label={toggle}
                title={toggle}
              >
                {full ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
              </Close>
            )}
            <Close type="button" onClick={onClose} aria-label={closeLabel}>
              <X size={18} />
            </Close>
          </Controls>
        </HeaderRow>
      </Header>
      {full ? (
        <Split>
          <Beside>{beside}</Beside>
          {children}
        </Split>
      ) : (
        children
      )}
    </Aside>
  )
}
