import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from "react"
import { useMediaQuery } from "usehooks-ts"
import { RAIL_HIDDEN } from "./styles"
import { useProfile } from "../db"
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

/** A phone's width: the site's md breakpoint, where the hamburger shows. */
const PHONE = "(max-width: 767.98px)"

/**
 * Whether the window is a phone's (PHONE), for what renders differently
 * there. False on the server and through the first render, so the page
 * hydrates as it was served; the stylesheet covers the phone meanwhile.
 * Without matchMedia, false; without a listener on what it gives (older
 * Safari has only the older one; the tests stand in for it with neither),
 * read once.
 */
export function usePhone() {
  return useMatches(PHONE)
}

/** Whether a committee page is without its rail (RAIL_HIDDEN, styles.ts), as
 * usePhone is for a phone's width. */
export function useRailHidden() {
  return useMatches(RAIL_HIDDEN)
}

/** Whether the window matches `media`, as usePhone describes. */
export function useMatches(media: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return
    const query = window.matchMedia(media)
    const update = () => setMatches(Boolean(query.matches))
    update()
    if (query.addEventListener) {
      query.addEventListener("change", update)
      return () => query.removeEventListener("change", update)
    }
    if (query.addListener) {
      query.addListener(update)
      return () => query.removeListener(update)
    }
  }, [media])
  return matches
}

/**
 * Fits `ref`'s one line of text to the room it has while `active`: its font
 * stepped down from the stylesheet's size just far enough that the line
 * fits, no smaller than `min` px, past which the stylesheet's ellipsis takes
 * over. The stylesheet's size again when not active. Measured again as the
 * room it sits in changes width, and when `text` changes.
 */
export function useFitText(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  min: number,
  text: string
) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      el.style.fontSize = ""
      if (!active || !el.scrollWidth || el.scrollWidth <= el.clientWidth) return
      const base = parseFloat(getComputedStyle(el).fontSize)
      const size = (base * el.clientWidth) / el.scrollWidth
      el.style.fontSize = `${Math.max(min, Math.floor(size * 10) / 10)}px`
    }
    fit()
    const room = el.parentElement
    if (!room || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(fit)
    observer.observe(room)
    return () => observer.disconnect()
  }, [ref, active, min, text])
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

/**
 * How far the rail of conferences, the first child of `page`, has been pushed
 * up past the navbar's edge by the end of the page, published on `scope` as
 * --rail-lift (0px, or less): the bands that hold at the top of the main
 * column add it to their own top, so they go with the rail rather than holding
 * on after it has started to leave. 0px where the rail isn't shown.
 */
export function useRailLift(
  page: RefObject<HTMLElement | null>,
  scope: RefObject<HTMLElement | null>
) {
  useLayoutEffect(() => {
    const el = scope.current
    if (!el || !page.current) return
    let published = ""
    const publish = () => {
      // Out of the page between a scroll and this, as one page gives way to
      // another: nothing to measure.
      const box = page.current
      if (!box) return
      const rail = box.firstElementChild as HTMLElement | null
      const height = rail?.offsetHeight ?? 0
      // The rail holds until the bottom of the page's content, inside its
      // padding, reaches its own bottom.
      const end =
        box.getBoundingClientRect().bottom -
        parseFloat(getComputedStyle(box).paddingBottom)
      const lift = height === 0 ? 0 : Math.min(0, end - height - navbarBottom())
      const value = `${Math.round(lift)}px`
      if (value === published) return
      published = value
      el.style.setProperty("--rail-lift", value)
    }
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(page.current)
    // Not a box inside the page, such as a bill text's sheet, whose scrolling
    // leaves the page where it was.
    const scrolled = (e: Event) => {
      if (e.target instanceof Node && page.current?.contains(e.target)) return
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
  }, [page, scope])
}
