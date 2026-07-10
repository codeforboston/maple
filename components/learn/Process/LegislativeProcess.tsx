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

const rowId = (i: number) => `learn-process-stage-${i}`
const panelId = (i: number) => `learn-process-panel-${i}`
const headerId = (i: number) => `learn-process-header-${i}`

/* ── Sticky journey rail ─────────────────────────────────────── */

const RailWrapper = styled.div`
  position: sticky;
  /* Measured at runtime — see the effect in LegislativeProcess. Falls back to a
     sensible constant before the first layout pass. */
  top: var(--maple-navbar-height, 6rem);
  z-index: 2;
  margin-inline: -2rem;
  padding: 0.5rem 2rem 1rem;
  background-color: var(--maple-surface-learn);

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
    &::before {
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

const ExpandAllButton = styled.button`
  display: inline;
  padding: 0;
  margin: 0.5rem 0 0;
  background: none;
  border: 0;
  color: var(--bs-blue);
  font-weight: 400;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    text-decoration: none;
  }

  &:focus-visible {
    outline: 2px solid var(--bs-blue);
    outline-offset: 2px;
    border-radius: var(--maple-radius-sm);
  }
`

/* A `position: sticky` element can only stick within its containing block.
   Scoping the rail to the chapters means it releases and scrolls away once the
   last chapter passes, rather than hovering over Additional Resources. */
const StickyScope = styled.div`
  position: relative;
`

/* ── Accordion ───────────────────────────────────────────────── */

const Row = styled.div`
  background: var(--maple-surface-base);
  border-radius: var(--maple-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  overflow: hidden;

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
    transition-delay: var(--learn-panel-delay, 0ms);
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
  onToggle,
  stagger = 0
}: {
  index: number
  chapter: Chapter
  color: string
  isOpen: boolean
  isActive: boolean
  onToggle: () => void
  /** Index used to stagger the open animation when several panels open at once. */
  stagger?: number
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
      style={
        {
          borderTop: isOpen ? `2px solid ${alpha(color, 9)}` : undefined,
          "--learn-panel-delay": `${stagger * 55}ms`
        } as React.CSSProperties
      }
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

  const [activeIdx, setActiveIdx] = useState(0)
  const [openIdx, setOpenIdx] = useState<number | null>(0)
  // "Expand all" is a temporary override. Any interaction with a rail node or a
  // chapter header drops back to the normal one-at-a-time accordion.
  const [expandAll, setExpandAll] = useState(false)

  const isOpen = (i: number) => expandAll || openIdx === i

  const railRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)
  const scopeRef = useRef<HTMLDivElement>(null)
  // Set when a rail node is clicked, so that expanding a row from its own
  // header does not also yank the page around.
  const pendingScrollRef = useRef<number | null>(null)
  // Set when "expand all" is pressed, so the subhead is brought to the top.
  const pendingHeaderScrollRef = useRef(false)
  const headerRef = useRef<HTMLDivElement>(null)

  // The rail must sit directly beneath whatever remains of the site navbar.
  //
  // A one-off height measurement is not enough: the navbar's `sticky-top` does
  // not always keep it pinned (it scrolls away on the mobile navbar, and its
  // stickiness can be defeated by an ancestor), which would leave the rail
  // floating with a strip of page content visible above it. So the offset
  // tracks the navbar's *current* bottom edge on scroll, clamped at zero, and
  // the rail hugs the very top once the navbar has scrolled out of view.
  useLayoutEffect(() => {
    const scope = scopeRef.current
    if (!scope) return

    let frame = 0
    const publishNavOffset = () => {
      const nav = document.querySelector(".main-navbar")
      const bottom = nav ? nav.getBoundingClientRect().bottom : 0
      const offset = Math.max(0, bottom)
      scope.style.setProperty("--maple-navbar-height", `${offset}px`)
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

    const nav = document.querySelector(".main-navbar")
    const observer = new ResizeObserver(schedule)
    if (nav) observer.observe(nav)

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

  // No manual scroll compensation here: the browser's native scroll anchoring
  // already keeps the reader's position stable when a panel above them opens or
  // closes. Compensating on top of it double-corrects, and near the bottom of
  // the document (where the scroll position also clamps as the page shrinks)
  // the two together walk the accordion backwards.

  useEffect(() => {
    const target = pendingScrollRef.current
    if (target === null) return
    pendingScrollRef.current = null

    const el = document.getElementById(rowId(target))
    if (!el) return

    const reduceMotion = prefersReducedMotion()
    // "nearest" scrolls the least distance that brings the whole card into
    // view. A card below the fold rises just far enough to be fully visible
    // rather than jumping to the top of the viewport; a card above the fold
    // aligns to its top, where scroll-margin-top clears the navbar and rail.
    el.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest"
    })
  }, [openIdx])

  useEffect(() => {
    if (!expandAll || !pendingHeaderScrollRef.current) return
    pendingHeaderScrollRef.current = false
    const el = headerRef.current
    if (!el) return
    el.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start"
    })
  }, [expandAll])

  // On narrow screens the rail overflows horizontally. Keep the active node
  // visible, whichever way the stage was selected.
  useEffect(() => {
    const track = trackRef.current
    if (!track || track.scrollWidth <= track.clientWidth) return

    const node = track.children[activeIdx] as HTMLElement | undefined
    if (!node) return

    const reduceMotion = prefersReducedMotion()
    track.scrollTo({
      left: node.offsetLeft - (track.clientWidth - node.offsetWidth) / 2,
      behavior: reduceMotion ? "auto" : "smooth"
    })
  }, [activeIdx])

  const selectStage = useCallback((i: number) => {
    pendingScrollRef.current = i
    setExpandAll(false)
    setActiveIdx(i)
    setOpenIdx(i)
  }, [])

  const toggleChapter = useCallback(
    (i: number) => {
      if (expandAll) {
        // Leaving expand-all: keep the chapter the reader just reached for.
        setExpandAll(false)
        setOpenIdx(i)
        setActiveIdx(i)
        return
      }
      setOpenIdx(prev => {
        const next = prev === i ? null : i
        if (next !== null) setActiveIdx(next)
        return next
      })
    },
    [expandAll]
  )

  const toggleExpandAll = useCallback(() => {
    setExpandAll(prev => {
      if (prev) return false
      pendingHeaderScrollRef.current = true
      return true
    })
    // Collapsing closes every chapter, including the one that was open before
    // expand-all was pressed.
    setOpenIdx(prev => (expandAll ? null : prev))
  }, [expandAll])

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
            subhead={
              <>
                {t("process.subhead")}{" "}
                <ExpandAllButton
                  type="button"
                  onClick={toggleExpandAll}
                  aria-expanded={expandAll}
                  aria-controls={chapters.map((_, i) => panelId(i)).join(" ")}
                >
                  {expandAll
                    ? t("process.collapseAll")
                    : t("process.expandAll")}
                </ExpandAllButton>
              </>
            }
          />
        </HeaderAnchor>

        <StickyScope>
          <RailWrapper ref={railRef}>
            <RailCard>
              <nav aria-label={t("process.railLabel")}>
                <RailTrack ref={trackRef}>
                  {stages.map((title, i) => {
                    const color = STAGE_COLORS[i]
                    // With every chapter expanded, no stage is "past" and all
                    // of them read as current.
                    const done = !expandAll && i < activeIdx
                    const current = expandAll || i === activeIdx
                    const Icon = STAGE_ICONS[i]

                    return (
                      <RailNode key={title}>
                        <button
                          type="button"
                          onClick={() => selectStage(i)}
                          aria-current={current ? "step" : undefined}
                          aria-controls={panelId(i)}
                          aria-expanded={isOpen(i)}
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
                                expandAll || i <= activeIdx
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
                stagger={expandAll ? i : 0}
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
