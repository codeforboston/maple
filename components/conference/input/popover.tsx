import { useCallback, useRef, useState } from "react"
import styled from "styled-components"
import { line, shadow } from "./tokens"
import { useDismiss } from "./useDismiss"

/** What a menu hangs from. */
export const Anchor = styled.div`
  position: relative;
  flex-shrink: 0;
`

/** The floating surface under a control. `$right` hangs it from the right
 * edge; widths and padding are set by whoever extends it. */
export const Menu = styled.div<{ $right?: boolean }>`
  position: absolute;
  ${({ $right }) => ($right ? "right: 0;" : "left: 0;")}
  top: calc(100% + 6px);
  z-index: 20;
  min-width: 200px;
  padding: 4px 0;
  background: var(--maple-surface-base);
  border: 1px solid ${line.default};
  border-radius: 8px;
  box-shadow: ${shadow.popover};
`

/** Open state for a menu, closed by a press outside it or Escape. */
export function usePopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen(o => !o), [])
  useDismiss(ref, open, close)
  return { ref, open, toggle, close }
}
