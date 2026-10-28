import { ReactNode, useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { X } from "./icons"
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

const Aside = styled.aside<{ $open: boolean }>`
  position: fixed;
  z-index: 40;
  right: 0;
  top: var(--maple-navbar-height);
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
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  padding: 24px 18px 4px;
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
  margin: 0 -6px 0 auto;
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
 * right, a sheet below lg, its left edge draggable. */
export function Panel({
  open,
  title,
  closeLabel,
  width,
  onDrag,
  onClose,
  children
}: {
  open: boolean
  title: string
  closeLabel: string
  width: number
  onDrag: (px: number) => void
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", key)
    return () => document.removeEventListener("keydown", key)
  }, [open, onClose])

  return (
    <Aside
      $open={open}
      style={{ width }}
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
        <Title>{title}</Title>
        <Close type="button" onClick={onClose} aria-label={closeLabel}>
          <X size={18} />
        </Close>
      </Header>
      {children}
    </Aside>
  )
}
