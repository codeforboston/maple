import { useEffect } from "react"

/** Holds the page still while something covers it, and lets it go after. */
export function useLockedScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [locked])
}
