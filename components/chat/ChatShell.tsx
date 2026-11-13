import { useTranslation } from "next-i18next"
import { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { ConversationRail, type RailThread } from "./ConversationRail"

// Fills the window below the site's nav bar (its height varies with width, so ChatShell measures
// it); the page itself does not scroll.
const Page = styled.div`
  height: calc(100dvh - var(--chat-top-offset, 96px));
  min-height: 520px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--maple-surface-page);
  color: var(--maple-text-body);

  ::selection {
    background: var(--maple-brand-primary);
    color: var(--maple-text-inverse);
  }
`

// Only on narrow screens, where the rail becomes a drawer.
const Menu = styled.button`
  display: none;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  background: var(--maple-surface-base);
  border: 0;
  border-bottom: 1px solid var(--maple-surface-border);
  color: var(--maple-brand-primary);
  font-weight: 700;

  @media (max-width: 820px) {
    display: flex;
  }
`

const Grid = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 280px 1fr;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`

export function ChatShell({
  threads,
  activeId,
  railStatus,
  onRailRetry,
  children
}: {
  threads: RailThread[]
  activeId?: string
  railStatus: "loading" | "error" | "ready"
  onRailRetry: () => void
  children: ReactNode
}) {
  const { t } = useTranslation("chat")
  const [drawer, setDrawer] = useState(false)
  const menuRef = useRef<HTMLButtonElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    const fit = () =>
      page.style.setProperty(
        "--chat-top-offset",
        `${page.getBoundingClientRect().top + window.scrollY}px`
      )
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [])
  const closeDrawer = useCallback(() => {
    setDrawer(false)
    menuRef.current?.focus() // focus returns to the menu button
  }, [])

  return (
    <Page ref={pageRef}>
      <Menu
        ref={menuRef}
        type="button"
        aria-controls="chat-rail"
        aria-expanded={drawer}
        onClick={() => setDrawer(open => !open)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M3 5.5h14M3 10h14M3 14.5h14" />
        </svg>
        {t("bar.menu")}
      </Menu>
      <Grid>
        <ConversationRail
          threads={threads}
          activeId={activeId}
          status={railStatus}
          onRetry={onRailRetry}
          drawerOpen={drawer}
          onCloseDrawer={closeDrawer}
        />
        {children}
      </Grid>
    </Page>
  )
}

/** "Today" or a short date for rail rows. */
export function dayLabel(iso: string, today: string): string {
  const d = new Date(iso)
  return d.toDateString() === new Date().toDateString()
    ? today
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}
