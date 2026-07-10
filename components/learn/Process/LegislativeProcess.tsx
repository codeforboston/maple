import { useTranslation } from "next-i18next"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react"
import styled from "styled-components"
import AdditionalResources from "../../AdditionalResources"
import { Internal } from "../../links"
import LearnBreadcrumb from "../LearnBreadcrumb"
import LearnHeader from "../LearnHeader"
import LearnLayout from "../LearnLayout"
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon
} from "../icons"
import { STAGE_ICONS } from "../icons/ProcessStageIcons"
import { STAGE_COLORS, TINT, alpha } from "../palette"

type Stat = { value: string; label: string; href?: string }
type Chapter = {
  num: string
  title: string
  lead: string
  body: string
  stat?: Stat
  callout?: string
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

/** Keep in sync with the Panel grid-template-rows transition below. */
const PANEL_TRANSITION_MS = 550

const rowId = (i: number) => `learn-process-stage-${i}`
const panelId = (i: number) => `learn-process-panel-${i}`
const headerId = (i: number) => `learn-process-header-${i}`

/* ── Sticky journey rail ─────────────────────────────────────── */

const RailWrapper = styled.div`
  position: sticky;
  /* Desktop: measured at runtime to sit below the sticky navbar (see the
     nav-offset effect). Falls back to a sensible constant before first paint. */
  top: var(--maple-navbar-height, 6rem);
  z-index: 2;
  margin-inline: -2rem;
  padding: 0.5rem 2rem 1rem;
  background-color: var(--maple-surface-learn);

  /* Below the 768px nav breakpoint the navbar is non-sticky and has scrolled
     away before the rail reaches the top, so the rail simply sticks at 0 -- no
     per-frame tracking, which is what made the initial scroll janky here. */
  @media (max-width: 48rem) {
    top: 0;
  }

  @media (max-width: 36rem) {
    margin-inline: -1rem;
    padding: 0.5rem 1rem 0.75rem;
  }
`

const RailCard = styled.div`
  position: relative;
  background: var(--maple-surface-base);
  border-radius: var(--maple-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  padding: 1.25rem 1.5rem;

  /* The rail scrolls horizontally on narrow screens and its scrollbar is
     hidden, so fade the trailing edge to signal there is more to see. */
  @media (max-width: 34rem) {
    &::after {
      content: "";
      position: absolute;
      inset-block: 1px;
      right: 1px;
      width: 2.5rem;
      pointer-events: none;
      border-radius: 0 var(--maple-radius-xl) var(--maple-radius-xl) 0;
      background: linear-gradient(
        to right,
        transparent,
        var(--maple-surface-base)
      );
    }
  }
`

const RailTrack = styled.ol`
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;

  /* The connecting line sits behind the nodes, inset so it doesn't poke out. */
  &::before {
    content: "";
    position: absolute;
    top: 1.6875rem;
    left: 1.5rem;
    right: 1.5rem;
    height: 2px;
    background: var(--bs-gray-200, #f3f4f6);
    z-index: 0;
  }

  /* Six nodes don't fit below ~34rem. Scroll the journey rather than wrap it,
     so the line keeps reading as a single sequence. */
  @media (max-width: 34rem) {
    justify-content: flex-start;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
    /* Setting overflow-x to auto forces overflow-y to auto as well, which clips
       the active node -- it is scaled up 12% and has a shadow. Pad the strip
       vertically so it has room; the negative margin keeps the card's height
       unchanged. The connecting line shifts down by the same amount to stay
       centered on the nodes. */
    padding-block: 0.5rem;
    margin-block: -0.5rem;
    &::before {
      top: calc(1.6875rem + 0.5rem);
      right: auto;
      width: max(100%, 30rem);
    }
  }
`

const RailNode = styled.li`
  position: relative;
  z-index: 1;
  flex: 0 0 auto;

  button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    width: 4.5rem;
    padding: 0;
    background: none;
    border: 0;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--bs-blue);
      outline-offset: 3px;
      border-radius: var(--maple-radius-md);
    }
  }

  .node {
    width: 3.375rem;
    height: 3.375rem;
    border-radius: var(--maple-radius-pill);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--maple-shadow-sm);
    transition: background 0.2s ease, border-color 0.2s ease,
      transform 0.2s ease;
  }

  .label {
    font-size: 0.6875rem;
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    transition: color 0.2s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .node {
      transition: none;
      transform: none !important;
    }
  }
`

const HeaderAnchor = styled.div`
  scroll-margin-top: calc(var(--maple-navbar-height) + 0.75rem);
`

const StickyScope = styled.div`
  position: relative;
`

/* ── Accordion ───────────────────────────────────────────────── */

const Row = styled.div`
  background: var(--maple-surface-base);
  border-radius: var(--maple-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  overflow: hidden;

  /* We compute the post-collapse scroll position ourselves, so the browser must
     not also try to hold position when a panel above this one collapses. */
  overflow-anchor: none;

  /* Smooth-scroll targets must clear the sticky navbar and the sticky rail
     when they align to the top, and keep a little air when they align to the
     bottom (scrollIntoView block: "nearest"). */
  scroll-margin-top: calc(
    var(--maple-navbar-height) + var(--learn-rail-height, 10rem) + 1rem
  );
  scroll-margin-bottom: 1rem;
`

const RowHeader = styled.h3`
  margin: 0;

  button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.25rem 1.75rem;
    text-align: left;
    background: none;
    border: 0;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: color-mix(
        in srgb,
        var(--bs-gray-100, #f9fafb) 60%,
        transparent
      );
    }

    &:focus-visible {
      outline: 2px solid var(--bs-blue);
      outline-offset: -2px;
    }
  }

  .num {
    font-family: var(--maple-font-heading);
    font-weight: 900;
    font-size: 2.25rem;
    line-height: 1;
    flex-shrink: 0;
    width: 3rem;
    transition: color 0.2s ease;
  }

  .spine {
    width: 4px;
    align-self: stretch;
    border-radius: var(--maple-radius-pill);
    flex-shrink: 0;
    transition: background 0.2s ease;
  }

  .text {
    flex: 1;
    min-width: 0;
  }

  .title {
    font-family: var(--maple-font-heading);
    font-weight: 700;
    color: var(--maple-text-strong);
    font-size: 1.125rem;
    line-height: 1.35;
    margin: 0;
  }

  .lead {
    color: var(--maple-text-muted);
    font-size: 0.875rem;
    line-height: 1.35;
    margin: 0.125rem 0 0;
  }

  .chevron {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: var(--maple-radius-pill);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  }

  @media (max-width: 36rem) {
    button {
      gap: 0.75rem;
      padding: 1rem;
    }
    .num {
      font-size: 1.75rem;
      width: 2.25rem;
    }
  }

  @media print {
    .chevron {
      display: none;
    }
    button {
      cursor: auto;
    }
  }
`

const Panel = styled.div`
  /* Animating grid-template-rows from 0fr to 1fr gives a height transition
     without knowing the content height. The delayed visibility keeps a closed
     panel out of the accessibility tree and the focus order once it has
     finished collapsing. */
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  visibility: hidden;
  transition: grid-template-rows 0.55s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease, visibility 0s linear 0.55s;

  &[data-open="true"] {
    grid-template-rows: 1fr;
    opacity: 1;
    visibility: visible;
    transition: grid-template-rows 0.55s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.32s ease 0.12s, visibility 0s;
  }

  .clip {
    min-height: 0;
    overflow: hidden;
  }

  .inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 1.75rem 1.75rem 5.5rem;
  }

  .body {
    color: var(--maple-text-body);
    line-height: 1.7;
    white-space: pre-line;
    margin: 0;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 0;
    border-top: 1px solid var(--maple-surface-border);
  }

  .stat-value {
    font-family: var(--maple-font-heading);
    font-weight: 700;
    font-size: 1.875rem;
  }

  .stat-label {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    color: var(--maple-text-muted);
    text-decoration: none;

    &:hover {
      color: var(--bs-blue);
      text-decoration: underline;
    }
  }

  .callout {
    border-radius: var(--maple-radius-lg);
    padding: 1rem 1.25rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;

    p {
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.7;
      margin: 0;
    }
  }

  @media (max-width: 36rem) {
    .inner {
      padding: 1rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &[data-open="true"] {
      transition: none;
    }
  }

  /* Every chapter prints expanded, whatever is open on screen. */
  @media print {
    display: block;
    grid-template-rows: none;
    opacity: 1;
    visibility: visible;
    transition: none;

    .clip {
      overflow: visible;
    }
  }
`

const StatLabel = ({ stat }: { stat: Stat }) => {
  if (!stat.href) return <span className="stat-label">{stat.label}</span>

  if (stat.href.startsWith("/"))
    return (
      <Internal href={stat.href} className="stat-label">
        {stat.label}
      </Internal>
    )

  return (
    <a
      className="stat-label"
      href={stat.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${stat.label} (opens in a new tab)`}
    >
      {stat.label}
      <ExternalLinkIcon sx={{ fontSize: "0.9375rem" }} />
    </a>
  )
}

const AccordionRow = ({
  index,
  chapter,
  color,
  isOpen,
  isActive,
  onToggle
}: {
  index: number
  chapter: Chapter
  color: string
  isOpen: boolean
  isActive: boolean
  onToggle: () => void
}) => (
  <Row
    id={rowId(index)}
    style={{
      outline: isActive && !isOpen ? `2px solid ${alpha(color, 25)}` : undefined
    }}
  >
    <RowHeader>
      <button
        type="button"
        id={headerId(index)}
        aria-expanded={isOpen}
        aria-controls={panelId(index)}
        onClick={onToggle}
      >
        <span
          className="num"
          aria-hidden="true"
          // TODO(a11y): a tinted stage colour cannot reach AA contrast against
          // white for green or orange. Kept as designed pending a palette
          // decision; axe reports this as a serious color-contrast violation.
          style={{ color: isOpen ? color : alpha(color, 16) }}
        >
          {chapter.num}
        </span>
        <span
          className="spine"
          aria-hidden="true"
          style={{ background: isOpen ? color : "transparent" }}
        />
        <span className="text">
          <span className="title d-block">{chapter.title}</span>
          <span className="lead d-block">{chapter.lead}</span>
        </span>
        <span
          className="chevron"
          aria-hidden="true"
          style={{ background: isOpen ? color : "var(--bs-gray-100, #f3f4f6)" }}
        >
          {isOpen ? (
            <ChevronUpIcon sx={{ fontSize: "1.125rem", color: "#fff" }} />
          ) : (
            <ChevronDownIcon
              sx={{ fontSize: "1.125rem", color: "var(--maple-text-muted)" }}
            />
          )}
        </span>
      </button>
    </RowHeader>

    <Panel
      id={panelId(index)}
      role="region"
      aria-labelledby={headerId(index)}
      data-open={isOpen ? "true" : "false"}
      style={{
        borderTop: isOpen ? `2px solid ${alpha(color, 9)}` : undefined
      }}
    >
      <div className="clip">
        <div className="inner">
          <p className="body">{chapter.body}</p>

          {chapter.stat && (
            <div className="stat">
              <span className="stat-value" style={{ color }}>
                {chapter.stat.value}
              </span>
              <StatLabel stat={chapter.stat} />
            </div>
          )}

          {chapter.callout && (
            <div className="callout" style={{ background: alpha(color, 7) }}>
              <span aria-hidden="true">🍁</span>
              <p style={{ color }}>{chapter.callout}</p>
            </div>
          )}
        </div>
      </div>
    </Panel>
  </Row>
)

export const LegislativeProcess = () => {
  const { t } = useTranslation("learn")
  const chapters = t("process.chapters", { returnObjects: true }) as Chapter[]
  const stages = t("process.stages", { returnObjects: true }) as string[]

  // Every chapter starts expanded. Each one collapses independently from its own
  // header; opening or closing one never touches the others.
  const [openChapters, setOpenChapters] = useState<Set<number>>(
    () => new Set(chapters.map((_, i) => i))
  )
  const isOpen = (i: number) => openChapters.has(i)

  // The rail is read-only feedback: it follows the chapter the reader is looking
  // at. It no longer opens or closes anything, so it cannot reflow the page.
  const [activeIdx, setActiveIdx] = useState(0)

  const railRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)
  const scopeRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Set when a rail node is clicked, so we scroll to that chapter.
  const pendingScrollRef = useRef<number | null>(null)
  const [scrollNonce, setScrollNonce] = useState(0)
  // While a programmatic scroll is running, the reader is not driving, so the
  // rail should not chase the intermediate positions.
  const suppressUntilRef = useRef(0)

  // Always start this page at the top on load. The browser otherwise restores
  // the previous scroll position on refresh, and the rail's highlight -- which
  // defaults to the first stage -- then snaps forward to match, animating every
  // completed tint and the active fill in at once: a visible flash across the
  // nodes. This page has no anchor/deep-link state worth restoring, so we reset
  // instead. A layout effect resets before paint, so there is no visible jump,
  // and switching restoration to "manual" keeps later refreshes from restoring.
  useLayoutEffect(() => {
    if (!("scrollRestoration" in window.history)) return
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = "manual"
    window.scrollTo(0, 0)
    return () => {
      window.history.scrollRestoration = previous
    }
  }, [])

  // The rail must sit directly beneath whatever remains of the sticky site
  // navbar, which stays pinned for most of the page on desktop, so the offset
  // tracks the navbar's current bottom edge on scroll.
  //
  // This runs on desktop only. Below the breakpoint the navbar is the
  // non-sticky MobileNav: it scrolls away immediately, and the rail does not
  // reach the top until well after it is gone, so the rail simply sticks at
  // top: 0 (set in CSS). Tracking there would rewrite the sticky offset every
  // frame during the navbar's exit -- recomputing the sticky rail each frame --
  // which is exactly the initial-scroll jank on mobile. So we skip it entirely
  // when the navbar is not sticky.
  useLayoutEffect(() => {
    const scope = scopeRef.current
    const nav = document.querySelector<HTMLElement>(".main-navbar")
    if (!scope || !nav) return
    if (getComputedStyle(nav).position !== "sticky") return

    let frame = 0
    const publishNavOffset = () => {
      const bottom = nav.getBoundingClientRect().bottom
      scope.style.setProperty(
        "--maple-navbar-height",
        `${Math.max(0, bottom)}px`
      )
    }
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        publishNavOffset()
      })
    }

    publishNavOffset()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)

    const observer = new ResizeObserver(schedule)
    observer.observe(nav)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      observer.disconnect()
    }
  }, [])

  // Publish the rail's real height so rows can reserve scroll-margin beneath it.
  // Measured rather than assumed, because the rail grows when stage labels wrap.
  // It is written to the shared ancestor: custom properties inherit down the
  // tree, and the rows are siblings of the rail, not its children.
  useLayoutEffect(() => {
    const rail = railRef.current
    const scope = scopeRef.current
    if (!rail || !scope) return
    const publish = () =>
      scope.style.setProperty("--learn-rail-height", `${rail.offsetHeight}px`)
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(rail)
    return () => observer.disconnect()
  }, [])

  // Scroll drives the rail's highlight, and nothing else. Because this changes
  // no layout, it cannot reflow the page.
  //
  // The highlight steps from the current stage rather than being recomputed from
  // scratch, using two lines measured from the rail's live bottom edge:
  //
  //   advancing  the next chapter's top crossing a line a little below the rail
  //              lights the next stage, while some of the current chapter is
  //              still in view
  //   retreating  the previous stage only lights again once the top of its own
  //              card has come back into view below the rail -- a stage never
  //              lights while its card's top is off-screen above
  //
  // The asymmetry is deliberate, and it is also what gives the switch its
  // hysteresis: going back up costs a whole card's height. A line that moved
  // with the direction of travel was much worse -- it jumped by the width of the
  // gap whenever the reader changed direction, so the highlight flickered on the
  // smallest nudge.
  useEffect(() => {
    let frame = 0

    const evaluate = () => {
      frame = 0
      if (performance.now() < suppressUntilRef.current) return

      const rail = railRef.current
      if (!rail) return
      const railRect = rail.getBoundingClientRect()
      const railBottom = railRect.bottom
      // Once the rail has scrolled away there is nothing to track against.
      if (railBottom <= 0) return

      // Mobile touch scroll was janky during the pre-lock phase -- while the
      // rail is still travelling up to its pinned position. Every highlight
      // change costs a re-render and a smooth horizontal auto-scroll of the
      // rail (the activeIdx effect below), and near the top the highlight
      // advances in quick succession, so those stutters bunch up and fight the
      // finger scroll. Deeper in, tall chapters space them out, which is why it
      // felt smooth only after the rail locked. Nothing needs highlighting
      // until the rail is pinned anyway -- the whole rail is on screen -- so on
      // mobile we hold off until it locks at the top (sticky top is 0 there).
      // Desktop keeps tracking from the start, where it was already smooth.
      const LOCK_EPS = 2
      if (
        railRect.top > LOCK_EPS &&
        window.matchMedia("(max-width: 48rem)").matches
      )
        return

      const ADVANCE_AT = railBottom + 120

      const tops = Array.from(
        document.querySelectorAll<HTMLElement>('[id^="learn-process-stage-"]')
      ).map(row => row.getBoundingClientRect().top)
      if (!tops.length) return

      setActiveIdx(prev => {
        let i = Math.min(prev, tops.length - 1)

        // Scrolling down: step forward while the next chapter's top has crossed
        // the advance line. Loops so a fast scroll catches up in one frame.
        while (i + 1 < tops.length && tops[i + 1] <= ADVANCE_AT) i++

        // Scrolling up: only when we did not just advance, step back while the
        // previous chapter's own top is back in view below the rail.
        if (i === prev) {
          while (i > 0 && tops[i - 1] >= railBottom) i--
        }

        return i === prev ? prev : i
      })
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(evaluate)
    }

    evaluate()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [])

  // Scroll to a chapter after a rail click. Nothing above it collapses any more,
  // so the only thing that can move it is its own panel opening -- which grows
  // downward and leaves the header where it is.
  useEffect(() => {
    const target = pendingScrollRef.current
    if (target === null) return
    pendingScrollRef.current = null

    const row = document.getElementById(rowId(target))
    const rail = railRef.current
    if (!row || !rail) return

    const reduceMotion = prefersReducedMotion()

    // Don't let the rail chase the smooth scroll on its way past other chapters.
    suppressUntilRef.current =
      performance.now() + (reduceMotion ? 50 : PANEL_TRANSITION_MS + 350)
    setActiveIdx(target)

    // Scroll so the chapter's top sits GAP below the rail, in document
    // coordinates. The rail sticks beneath the site navbar, which is
    // `sticky-top` inside a fixed-height (vh-100) page container -- so the navbar
    // only stays pinned while that container is in view, then scrolls away with
    // it. Its bottom edge therefore follows navbarBottom(y) = min(navHeight,
    // V - y), where V is the container's document height. Solving for the scroll
    // that lands the chapter GAP below the rail gives two regimes:
    //
    //   navbar still pinned at the destination -> reserve its height
    //   navbar already gone (deeper chapters)  -> do not
    //
    // We measure the release point rather than hardcode which chapters are past
    // it, so it stays correct on any viewport.
    //
    // Below the 768px breakpoint the navbar swaps to the non-sticky MobileNav,
    // which is gone the instant you scroll -- so nothing reserves it there. We
    // detect that by reading the rendered navbar's `position` instead of
    // duplicating the breakpoint, so this can't drift out of sync with Navbar.
    //
    // Sticky live rects are unreliable (they report the unstuck position near
    // the top and the stuck one after scrolling), so we work from intrinsic
    // heights and the container's document bottom, all constant at any scroll.
    const GAP = 16
    const nav = document.querySelector<HTMLElement>(".main-navbar")
    const navHeight = nav ? nav.offsetHeight : 0
    const navSticky = !!nav && getComputedStyle(nav).position === "sticky"
    const containerBottom = nav?.parentElement
      ? nav.parentElement.getBoundingClientRect().bottom + window.scrollY
      : window.innerHeight
    const railHeight = rail.offsetHeight
    const rowDocTop = row.getBoundingClientRect().top + window.scrollY

    // Desktop: the sticky navbar releases at the container's bottom edge.
    // Mobile: the navbar never sticks, so it is effectively released at once.
    const releasePoint = navSticky ? containerBottom - navHeight : 0
    const yWithNavbar = rowDocTop - navHeight - railHeight - GAP
    const targetY = Math.max(
      0,
      yWithNavbar <= releasePoint ? yWithNavbar : rowDocTop - railHeight - GAP
    )
    window.scrollTo({
      top: targetY,
      behavior: reduceMotion ? "auto" : "smooth"
    })
  }, [scrollNonce])

  // On narrow screens the rail overflows horizontally. Keep the active node
  // visible as the highlight moves.
  useEffect(() => {
    const track = trackRef.current
    if (!track || track.scrollWidth <= track.clientWidth) return

    const node = track.children[activeIdx] as HTMLElement | undefined
    if (!node) return

    track.scrollTo({
      left: node.offsetLeft - (track.clientWidth - node.offsetWidth) / 2,
      behavior: prefersReducedMotion() ? "auto" : "smooth"
    })
  }, [activeIdx])

  // A rail click scrolls to the chapter, and opens it only if it was collapsed.
  // It never closes anything.
  const selectStage = useCallback((i: number) => {
    setOpenChapters(prev => {
      if (prev.has(i)) return prev
      const next = new Set(prev)
      next.add(i)
      return next
    })
    pendingScrollRef.current = i
    setScrollNonce(n => n + 1)
  }, [])

  // A chapter header toggles just that chapter, and does not scroll.
  const toggleChapter = useCallback((i: number) => {
    setOpenChapters(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }, [])

  return (
    // "medium" rather than "narrow": the h1 wraps at 48rem.
    <LearnLayout width="medium">
      <div ref={scopeRef}>
        <LearnBreadcrumb section={t("process.breadcrumb")} />
        <HeaderAnchor ref={headerRef}>
          <LearnHeader
            title={t("process.title")}
            titleSize="2.375rem"
            subheadMaxWidth="none"
            subhead={t("process.subhead")}
          />
        </HeaderAnchor>

        <StickyScope>
          <RailWrapper ref={railRef}>
            <RailCard>
              <nav aria-label={t("process.railLabel")}>
                <RailTrack ref={trackRef}>
                  {stages.map((title, i) => {
                    const color = STAGE_COLORS[i]
                    const done = i < activeIdx
                    const current = i === activeIdx
                    const Icon = STAGE_ICONS[i]

                    return (
                      <RailNode key={title}>
                        <button
                          type="button"
                          onClick={() => selectStage(i)}
                          aria-current={current ? "step" : undefined}
                          aria-controls={panelId(i)}
                        >
                          <span
                            className="node"
                            style={{
                              background: current
                                ? color
                                : done
                                ? TINT[color]
                                : "var(--bs-gray-50, #f9fafb)",
                              border: `2px solid ${
                                i <= activeIdx
                                  ? color
                                  : "var(--bs-gray-200, #e5e7eb)"
                              }`,
                              transform: current ? "scale(1.12)" : "scale(1)"
                            }}
                          >
                            {done ? (
                              <CheckIcon sx={{ fontSize: "1.125rem", color }} />
                            ) : (
                              <span style={{ opacity: current ? 1 : 0.55 }}>
                                <Icon />
                              </span>
                            )}
                          </span>
                          <span
                            className="label"
                            style={{
                              color: current ? color : "var(--maple-text-muted)"
                            }}
                          >
                            {title}
                          </span>
                        </button>
                      </RailNode>
                    )
                  })}
                </RailTrack>
              </nav>
            </RailCard>
          </RailWrapper>

          <div className="d-flex flex-column gap-3 mt-4">
            {chapters.map((chapter, i) => (
              <AccordionRow
                key={chapter.num}
                index={i}
                chapter={chapter}
                color={STAGE_COLORS[i]}
                isOpen={isOpen(i)}
                isActive={activeIdx === i}
                onToggle={() => toggleChapter(i)}
              />
            ))}
          </div>
        </StickyScope>

        <AdditionalResources />
      </div>
    </LearnLayout>
  )
}

export default LegislativeProcess
