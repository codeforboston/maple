import Router, { useRouter } from "next/router"
import {
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { useMediaQuery } from "usehooks-ts"
import { useProfile } from "../db"
import { navbarBottom } from "./navbar"

/** Whether the page arriving is one Back or Forward reached within the app,
 * where the browser puts the reader back. Those have moved the address by the
 * time Next starts the change; a link, such as a rail click from a scrolled
 * landing, moves it after. A reload is not one: Layout renders nothing until
 * the client mounts, so the browser has nothing to restore against. */
let returning = false
if (typeof window !== "undefined")
  Router.events.on("routeChangeStart", (url: string) => {
    returning = new URL(url, location.href).href === location.href
  })

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

/** How far into the conference the window still snaps, in px: enough that a
 * flick coming up through it is already being snapped at its top. */
const SNAP_REACH = 120

/** Where `el` starts in the document, in px. */
const topOf = (el: HTMLElement | null) =>
  el ? Math.max(0, el.getBoundingClientRect().top + window.scrollY) : 0

/**
 * Where a conference page rests: on the whole hero, or on the conference from
 * its top. Returns the ref for the conference's column and the scroll that
 * puts the reader at its top.
 *
 * The landing opens on the hero and every other address on the conference,
 * on each change of address, since a rail click is a client navigation that
 * Next would otherwise scroll to the hero. The browser's own mandatory snap
 * keeps the reader off the stretch where both would share the screen; it is
 * on only near the top, because a snapping window eases every scroll further
 * down too.
 */
export function useConferenceTop(openOnHero: boolean) {
  const { asPath } = useRouter()
  const top = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)
  const hero = useRef<HTMLElement>(null)
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)")

  const toConference = useCallback(
    () =>
      window.scrollTo({
        top: topOf(top.current),
        behavior: reduceMotion ? "auto" : "smooth"
      }),
    [reduceMotion]
  )

  // The site's header scrolls away above the hero. Resting on the hero means
  // resting at the document's top with the header showing, so the hero's snap
  // point and height are measured from where it starts.
  //
  // Where the conference starts is measured here, not on each scroll event,
  // and again whenever the page's size changes: the header can change height
  // without a resize, from a webfont arriving or the nav items changing with
  // sign-in.
  useLayoutEffect(() => {
    const root = document.documentElement
    let offset = -1
    let reach = 0
    const sync = () => {
      const want = window.scrollY <= reach ? "y mandatory" : ""
      if (root.style.scrollSnapType !== want) root.style.scrollSnapType = want
    }
    const measure = () => {
      if (!hero.current) return
      const next = topOf(hero.current)
      if (next !== offset) {
        offset = next
        root.style.setProperty("--conference-nav", `${offset}px`)
      }
      reach = topOf(top.current) + SNAP_REACH
      sync()
    }
    measure()
    const observer = new ResizeObserver(measure)
    // The hero's own height is where the conference starts: it follows the
    // window's height and its text's wrapping.
    if (hero.current) observer.observe(hero.current)
    // Whatever sits above the hero moves it when it changes height, however
    // far up: the siblings before it and before each of its ancestors. The
    // body is no use, being a fixed-height box.
    for (let el = hero.current; el && el !== document.body; ) {
      if (el.previousElementSibling) observer.observe(el.previousElementSibling)
      el = el.parentElement
    }
    window.addEventListener("scroll", sync, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", sync)
      root.style.removeProperty("--conference-nav")
      root.style.scrollSnapType = ""
    }
  }, [])

  useLayoutEffect(() => {
    // On arriving by Back the browser has put the reader back, at the top
    // too: leave them there. Any other arrival, or a later change of address,
    // is a click.
    const restored = !mounted.current && returning
    mounted.current = true
    if (location.hash || restored) return
    const start = openOnHero ? 0 : topOf(top.current)
    window.scrollTo({ top: start, behavior: "auto" })
    if (openOnHero) return
    // A font arriving after the jump can resize the hero; put the reader
    // back unless they have scrolled since.
    let stale = false
    document.fonts?.ready.then(() => {
      if (stale || Math.abs(window.scrollY - start) > 1) return
      window.scrollTo({ top: topOf(top.current), behavior: "auto" })
    })
    return () => {
      stale = true
    }
  }, [asPath, openOnHero])

  return { top, hero, toConference }
}

/**
 * Publishes where the site navbar's bottom edge is on `scope` as
 * --maple-navbar-height, so what pins under it pins flush, and follows it as
 * it scrolls away. The stylesheet's 4.5rem is neither the desktop bar, which
 * is shorter or taller with the window and lets go a window down, nor the
 * phone bar, which is not sticky. The learn page's rail tracks the same edge.
 */
export function usePinnedNavbar(scope: RefObject<HTMLElement>) {
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
    // it is now.
    document.addEventListener("scroll", publish, {
      passive: true,
      capture: true
    })
    window.addEventListener("resize", publish)
    return () => {
      observer.disconnect()
      document.removeEventListener("scroll", publish, { capture: true })
      window.removeEventListener("resize", publish)
    }
  }, [scope])
}
