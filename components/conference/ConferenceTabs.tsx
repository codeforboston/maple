import { useEffect, useState } from "react"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { jumpTo } from "./navbar"

/** The mockup's theme.css values, for the colours the site has no token for. */
const ink = { strong: "#141413", mid: "#73726c" }
const rule = "rgba(0, 0, 0, 0.16)"
const brand = "#1f3b61"

/** The row's height, its tabs' padding and rules and one line of text, is
 * what ConferenceDetails parks a section under, with the mockup's 24px. */
const Row = styled.nav`
  display: flex;
  gap: 22px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid ${rule};
`

const Tab = styled.a`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  padding: 14px 0 12px;
  border-bottom: 2px solid transparent;
  font-size: 0.8125rem;
  white-space: nowrap;
  color: ${ink.mid};
  text-decoration: none;
  &:hover,
  &[aria-current="true"] {
    color: ${ink.strong};
  }
  &[aria-current="true"] {
    border-bottom-color: ${brand};
    font-weight: 600;
  }
`

/** The page's sections, as the mockup's tab row: each tab scrolls to its
 * section, and the one being read is underlined. A row of one has nothing to
 * choose between, so it is left out. */
export function ConferenceTabs({ sections }: { sections: readonly string[] }) {
  const { t } = useTranslation("conferences")
  const [current, setCurrent] = useState(sections[0])

  useEffect(() => {
    // A section is being read once its top has come up to where a jump parks
    // it, its own scroll margin, so the tab pressed is the tab lit. Measured
    // on every scroll rather than observed: an observer picks a band of the
    // window, and the last section on the page may never reach it.
    const read = () => {
      let last = sections[0]
      for (const s of sections) {
        const el = document.getElementById(s)
        if (!el) continue
        const parked = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
        // The half pixel keeps a landing that rounds down from missing it.
        if (el.getBoundingClientRect().top <= parked + 0.5) last = s
      }
      setCurrent(last)
    }
    read()
    const column = document.getElementById(sections[0])?.parentElement
    // Capture, so the page's own scrolling box is heard as well as the window,
    // but not a box inside the column, such as a bill text's sheet, whose
    // scrolling moves no section.
    const scrolled = (e: Event) => {
      if (e.target instanceof Node && column?.contains(e.target)) return
      read()
    }
    document.addEventListener("scroll", scrolled, {
      passive: true,
      capture: true
    })
    // A section can move without a scroll, when one above it appears or
    // grows, or the window narrows, so the column holding them is watched too.
    const observer = new ResizeObserver(read)
    if (column) observer.observe(column)
    return () => {
      document.removeEventListener("scroll", scrolled, { capture: true })
      observer.disconnect()
    }
  }, [sections])

  if (sections.length < 2) return null
  return (
    <Row aria-label={t("tabs_label")}>
      {sections.map(s => (
        <Tab
          key={s}
          href={`#${s}`}
          aria-current={current === s ? "true" : undefined}
          onClick={e => {
            const el = document.getElementById(s)
            if (!el) return
            e.preventDefault()
            jumpTo(el)
            // Next's state kept: on Back to a null-state entry Next only
            // rewrites the URL, leaving the page it came from on screen.
            // Its as path takes the hash, since Back restores that path.
            const state = history.state
            const as = state?.as && `${state.as.split("#")[0]}#${s}`
            history.replaceState(as ? { ...state, as } : state, "", `#${s}`)
          }}
        >
          {t(`tab_${s}`)}
        </Tab>
      ))}
    </Row>
  )
}
