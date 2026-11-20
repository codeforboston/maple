import { RefObject, useEffect, useLayoutEffect, useRef } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { formatBillId } from "../formatting"
import { navbarBottom } from "./navbar"
import { followedFromSidebar, SidebarGroups } from "./SidebarGroups"
import { ConferenceSummary } from "./types"

/** In Lexend, the conference names and bill numbers alike. Pinned at the
 * navbar's edge, as the title is (ConferenceDetails.tsx, TitleBand), and with
 * the title's 1.625rem above its first row, so the two start level. Taller
 * than the window leaves, it rests at its foot or its top as the page
 * scrolls (useTwoWaySticky). */
const Nav = styled.nav`
  font-family: var(--maple-font-heading);
  flex: 0 0 auto;
  /* 288px at 1440px, giving up 1px for every 10px the page narrows (the
     window, less the input panel beside it: --page-w, ConferenceDetails.tsx),
     until the compact rail takes over (FULL_RAIL_FROM, styles.ts). */
  width: clamp(
    200px,
    calc(243.2px + (var(--page-w, 100vw) - 992px) * 0.1),
    288px
  );
  position: sticky;
  top: var(--maple-navbar-height);
  /* Over the title's and the tabs' bands (Band in ConferenceDetails.tsx, 14
     and 13), whose ground runs to the rail's edge. */
  z-index: 15;
  align-self: flex-start;
  /* 1rem under its last line, which is all that shows under it as it rests
     at its foot (useTwoWaySticky). */
  padding: 1.625rem 0 1rem;
`

/** This is a scroll listener that attaches the sticky sidebar to the page
 * scroll in order to prevent double scrolling and competing scrolls. For
 * the user, while scrolling down, the sidebar moves up with the page until
 * its last item shows, then stays put. Scrolling up, it moves back down
 * until its first item is under the navbar, then stays put.
 *
 * Its top and margin go straight onto the element's style, on purpose, the
 * one place in the rail that does: they're measured as the page scrolls, and
 * set through styled-components they would re-render the rail and make a new
 * class on every frame. */
function useTwoWaySticky(el: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const rail = el.current
    const page = rail?.parentElement
    if (!rail || !page) return
    let last = window.scrollY
    // Resting under the navbar (the CSS's own top), rather than free to move.
    let held = true
    let frame = 0
    const hold = () => {
      held = true
      rail.style.top = ""
      rail.style.marginTop = ""
    }
    // In the page's flow where it is now, resting at its foot once that's in
    // view.
    const free = () => {
      held = false
      const at =
        rail.getBoundingClientRect().top - page.getBoundingClientRect().top
      rail.style.marginTop = `${at}px`
      rail.style.top = `${window.innerHeight - rail.offsetHeight}px`
    }
    const place = () => {
      const y = window.scrollY
      const down = y > last
      const up = y < last
      last = y
      // If the sidebar is taller than the space below the navbar, it scrolls
      // with the page. Otherwise it stays pinned under the navbar.
      if (rail.offsetHeight <= window.innerHeight - navbarBottom()) hold()
      else if (held && down) free()
      else if (!held && up) {
        if (rail.getBoundingClientRect().top >= navbarBottom()) hold()
        else free()
      } else if (!held)
        rail.style.top = `${window.innerHeight - rail.offsetHeight}px`
    }
    const later = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(place)
    }
    // Its height changes as a group opens or closes.
    const grown =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(later)
        : undefined
    grown?.observe(rail)
    window.addEventListener("scroll", later, { passive: true })
    window.addEventListener("resize", later)
    return () => {
      cancelAnimationFrame(frame)
      grown?.disconnect()
      window.removeEventListener("scroll", later)
      window.removeEventListener("resize", later)
      // Resets the CSS once the listeners are removed.
      rail.style.top = ""
      rail.style.marginTop = ""
    }
  }, [el])
}

/** "S.1234 · H.5678", the status once the conference has finished, and a
 * label where we haven't covered it. The caller styles `.status`, and
 * `.uncovered` for the "Not covered" label. */
export function BillLine({
  c,
  noteUncovered = true
}: {
  c: ConferenceSummary
  /** "Not covered" where we haven't covered it; off in the Explorer's
   * table (ConferenceTable). */
  noteUncovered?: boolean
}) {
  const { t } = useTranslation("conferences")
  return (
    <>
      {formatBillId(c.senateBillId)} · {formatBillId(c.houseBillId)}
      {c.status !== "appointed" && (
        <span className="status">{t(`status.${c.status}`)}</span>
      )}
      {noteUncovered && !c.covered && (
        <span className="status uncovered">{t("not_covered")}</span>
      )}
    </>
  )
}

/**
 * Every conference, down the left, with the one being read marked by a bar.
 * In the flow rather than absolute: the column is the page's navigation
 * between conferences, so it stays where a user found it.
 */
export function ConferenceRail({
  conferences,
  current,
  className
}: {
  conferences: ConferenceSummary[]
  current: string
  className?: string
}) {
  const { t } = useTranslation("conferences")
  const nav = useRef<HTMLElement>(null)
  useTwoWaySticky(nav)
  // When the user clicks a new item in the sidebar, this scrolls the new page
  // to just below the header. It runs before the page shows, so the user
  // doesn't see the jump.
  useLayoutEffect(() => {
    const followed = followedFromSidebar()
    const rail = nav.current
    const page = rail?.parentElement
    if (!followed || !rail?.offsetParent || !page) return
    window.scrollTo({
      top: page.getBoundingClientRect().top + window.scrollY - navbarBottom()
    })
  }, [])
  return (
    <Nav ref={nav} aria-label={t("in_conference")} className={className}>
      <SidebarGroups conferences={conferences} current={current} />
    </Nav>
  )
}
