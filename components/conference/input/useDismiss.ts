import { RefObject, useEffect } from "react"

/** Closes a popover on a press outside it or on Escape. */
export function useDismiss(
  ref: RefObject<HTMLElement>,
  open: boolean,
  close: () => void
) {
  useEffect(() => {
    if (!open) return
    const away = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) close()
    }
    const key = (e: KeyboardEvent) => e.key === "Escape" && close()
    document.addEventListener("mousedown", away)
    document.addEventListener("keydown", key)
    return () => {
      document.removeEventListener("mousedown", away)
      document.removeEventListener("keydown", key)
    }
  }, [ref, open, close])
}
