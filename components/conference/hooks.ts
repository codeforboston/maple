import {
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState
} from "react"
import { useAsync } from "react-async-hook"
import { useMediaQuery } from "usehooks-ts"
import { currentGeneralCourt } from "functions/src/shared"
import { useProfile } from "../db"
import { Conference, listAppointedConferences } from "../db/conferences"
import { byName } from "./types"
import { navbarBottom } from "./navbar"

/**
 * What the pointer is over, and a setter that ignores it on a coarse pointer:
 * a finger has no hover, and iOS sends one on the way to a tap, so there only
 * the tap counts.
 */
export function useHover<T>() {
  const touch = useMediaQuery("(pointer: coarse)")
  const [hovered, setHovered] = useState<T | null>(null)
  const hover = useCallback(
    (value: T | null) => {
      if (!touch) setHovered(value)
    },
    [touch]
  )
  return [hovered, hover] as const
}

/** Member codes of the reader's own representative and senator. */
export function useMyLegislators() {
  const { profile } = useProfile()
  const rep = profile?.representative?.id
  const sen = profile?.senator?.id
  return useMemo(
    () => new Set([rep, sen].filter((id): id is string => Boolean(id))),
    [rep, sen]
  )
}

/**
 * Publishes where the site navbar's bottom edge is on `scope` as
 * --maple-navbar-height, so what pins under it pins flush, and follows it as
 * it scrolls away. The stylesheet's 4.5rem is neither the desktop bar, which
 * is shorter or taller with the window and lets go a window down, nor the
 * phone bar, which is not sticky. The learn page's rail tracks the same edge.
 */
export function usePinnedNavbar(scope: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = scope.current
    if (!el) return
    let nav: Element | null = null
    let published = ""
    const publish = () => {
      // The navbar is a different element either side of its breakpoint.
      const now = document.querySelector(".main-navbar")
      if (now !== nav) {
        if (nav) observer.unobserve(nav)
        if (now) observer.observe(now)
        nav = now
      }
      // Written only when it moves, which is rarely: most scrolls leave the
      // bar where it was, and a write would restyle the page.
      const value = `${navbarBottom()}px`
      if (value === published) return
      published = value
      el.style.setProperty("--maple-navbar-height", value)
    }
    const observer = new ResizeObserver(publish)
    publish()
    // Capture, and registered before the tabs', so they read the edge where
    // it is now; but not a box inside `scope`, such as a bill text's sheet,
    // whose scrolling leaves the navbar where it was.
    const scrolled = (e: Event) => {
      if (e.target instanceof Node && el.contains(e.target)) return
      publish()
    }
    document.addEventListener("scroll", scrolled, {
      passive: true,
      capture: true
    })
    window.addEventListener("resize", publish)
    return () => {
      observer.disconnect()
      document.removeEventListener("scroll", scrolled, { capture: true })
      window.removeEventListener("resize", publish)
    }
  }, [scope])
}

/** Read once per visit: every page's navbar asks for the same list. */
let appointed: Promise<Conference[]> | undefined
const loadAppointed = () =>
  (appointed ??= listAppointedConferences(currentGeneralCourt)
    // As the rail sorts them: all of these are appointed, so by name.
    .then(all => all.sort(byName))
    .catch(() => {
      // A failed read leaves the menu without them; try again next page.
      appointed = undefined
      return []
    }))

/** The current court's conferences taking input, for the navbar's menu.
 * Empty while loading, and where there are none or the read fails. */
export function useAppointedConferences(): Conference[] {
  return useAsync(loadAppointed, []).result ?? []
}
