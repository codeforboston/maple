import { forwardRef, useRef, useState } from "react"
import styled from "styled-components"
import { Dropdown } from "components/bootstrap"
import { ink, line, shadow, wash } from "./tokens"

/** What a menu hangs from. Dropdown moves focus through the items on the
 * arrow keys, and closes on Escape, Tab or a press outside. None of these
 * controls wears Bootstrap's caret. */
export const Anchor = styled(Dropdown)`
  flex-shrink: 0;
  & .dropdown-toggle::after {
    display: none;
  }
`

/** Dropdown's toggle, saying it opens a menu while still closed: Dropdown
 * only adds aria-haspopup once the menu has mounted, on the first open. */
export const Toggle = forwardRef<HTMLButtonElement>(function Toggle(
  props,
  ref
) {
  return <Dropdown.Toggle ref={ref} aria-haspopup="menu" {...props} />
}) as typeof Dropdown.Toggle

/** The floating surface under a control, `$gap` pixels below it. Widths and
 * padding are set by whoever extends it; items colour themselves through
 * Bootstrap's item variables, so its hover and focus rules keep working. */
export const Menu = styled(Dropdown.Menu).attrs<{ $gap?: number }>(
  ({ $gap = 6 }) => ({
    popperConfig: {
      modifiers: [
        { name: "offset", options: { offset: [0, $gap] } },
        // It sits in its control's own flow, so scrolling carries both;
        // left on, every menu opened once re-places itself on each scroll.
        { name: "eventListeners", options: { scroll: false } }
      ]
    }
  })
)<{ $gap?: number }>`
  && {
    --bs-dropdown-zindex: 20;
    --bs-dropdown-min-width: 200px;
    --bs-dropdown-padding-y: 4px;
    --bs-dropdown-font-size: 0.8125rem;
    --bs-dropdown-bg: var(--maple-surface-base);
    --bs-dropdown-border-color: ${line.default};
    --bs-dropdown-border-radius: 8px;
    --bs-dropdown-link-color: ${ink.strong};
    --bs-dropdown-link-hover-color: ${ink.strong};
    --bs-dropdown-link-hover-bg: ${wash.default};
    --bs-dropdown-link-active-color: ${ink.strong};
    --bs-dropdown-link-active-bg: ${wash.default};
    box-shadow: ${shadow.popover};
  }
`

/** On a phone, a picker's menu stays under its control and narrows to the
 * room left on the right, rather than sliding left to fit. Measured as it
 * opens, so the menu is placed at its narrowed width. Spread onto the Anchor
 * (ref, onToggle) and the Menu (style). */
export function useRoom() {
  const ref = useRef<HTMLDivElement>(null)
  const [room, setRoom] = useState<number>()
  const onToggle = (show: boolean) => {
    const el = ref.current
    setRoom(
      show && el && innerWidth < 640
        ? Math.max(
            200,
            Math.round(innerWidth - el.getBoundingClientRect().left - 16)
          )
        : undefined
    )
  }
  return { ref, onToggle, style: room ? { maxWidth: room } : undefined }
}
