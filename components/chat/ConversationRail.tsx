import { useTranslation } from "next-i18next"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { Button } from "react-bootstrap"
import styled from "styled-components"
import { PlusIcon } from "./Icons"

export type RailThread = { id: string; title: string; updatedLabel: string }

const Nav = styled.nav<{ $open: boolean }>`
  background: var(--maple-surface-base);
  border-right: 1px solid var(--maple-surface-border);
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;

  @media (max-width: 820px) {
    position: fixed;
    top: var(--chat-bar-height, 64px);
    bottom: 0;
    height: auto;
    left: 0;
    width: min(86vw, 320px);
    z-index: 4;
    transform: ${p => (p.$open ? "none" : "translateX(-102%)")};
    visibility: ${p => (p.$open ? "visible" : "hidden")};
    box-shadow: ${p => (p.$open ? "var(--maple-shadow-hover)" : "none")};
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
      visibility 0s ${p => (p.$open ? "0s" : "0.28s")};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const Scrim = styled.div`
  display: none;

  @media (max-width: 820px) {
    display: block;
    position: fixed;
    inset: var(--chat-bar-height, 64px) 0 0 0;
    background: var(--maple-overlay-backdrop-subtle);
    z-index: 3;
  }
`

const NewLink = styled(Link)`
  margin: 16px 16px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--maple-space-sm);
  min-height: 44px;
  padding: 10px 14px;
  border-radius: var(--maple-radius-lg);
  background: var(--maple-brand-primary);
  color: var(--maple-text-inverse);
  font-weight: 700;
  text-decoration: none;
  transition: background var(--maple-transition-fast);

  &:hover {
    background: var(--maple-brand-primary-strong);
    color: var(--maple-text-inverse);
  }

  &:focus-visible {
    outline: 3px solid var(--maple-chat-focus);
    outline-offset: 2px;
  }
`

const Heading = styled.h2`
  margin: 18px 20px 6px;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--maple-text-muted);
`

const Threads = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0 8px 16px;
  overflow: auto;
  scrollbar-color: var(--maple-chat-tint-strong) transparent;
`

const ThreadLink = styled(Link)`
  display: block;
  padding: 10px 12px;
  border-radius: var(--maple-radius-lg);
  color: var(--maple-text-strong);
  text-decoration: none;
  line-height: 1.35;

  &:hover {
    background: var(--maple-chat-tint);
    color: var(--maple-text-strong);
  }

  &[aria-current="page"] {
    background: var(--maple-chat-tint-strong);
    color: var(--maple-brand-primary);
    font-weight: 700;

    small {
      color: var(--maple-text-body);
    }
  }

  &:focus-visible {
    outline: 3px solid var(--maple-chat-focus);
    outline-offset: -3px;
  }

  small {
    display: block;
    color: var(--maple-text-muted);
    font-weight: 400;
    font-size: 0.82rem;
    margin-top: 2px;
  }
`

// 2-line clamp is visual only: the full title stays in the DOM for screen readers.
const Clamp = styled.span`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Skeleton = styled.li`
  height: 54px;
  margin: 4px 4px 8px;
  border-radius: var(--maple-radius-lg);
  background: var(--maple-chat-tint);
`

const Quiet = styled.p`
  margin: 4px 20px;
  font-size: 0.88rem;
  color: var(--maple-text-muted);
`

export function ConversationRail({
  threads,
  activeId,
  status,
  onRetry,
  drawerOpen = false,
  onCloseDrawer
}: {
  threads: RailThread[]
  activeId?: string
  status: "loading" | "error" | "ready"
  onRetry?: () => void
  /** Phone width only (≤820px): the page's menu button opens it and gets focus back on close. */
  drawerOpen?: boolean
  onCloseDrawer?: () => void
}) {
  const { t } = useTranslation("chat")
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!drawerOpen) return
    navRef.current?.querySelector<HTMLElement>("a, button")?.focus()
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseDrawer?.()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [drawerOpen, onCloseDrawer])

  return (
    <>
      <Nav
        ref={navRef}
        id="chat-rail"
        aria-label={t("rail.label")}
        $open={drawerOpen}
      >
        <NewLink href="/chat/new">
          <PlusIcon />
          {t("rail.new")}
        </NewLink>
        <Heading>{t("rail.heading")}</Heading>

        {status === "loading" && (
          <Threads aria-busy="true">
            {[0, 1, 2].map(i => (
              <Skeleton key={i} />
            ))}
          </Threads>
        )}

        {status === "error" && (
          <Quiet>
            {t("rail.failed")}{" "}
            <Button
              variant="link"
              className="p-0 align-baseline"
              onClick={onRetry}
            >
              {t("rail.retry")}
            </Button>
          </Quiet>
        )}

        {status === "ready" && threads.length === 0 && (
          <Quiet>{t("rail.empty")}</Quiet>
        )}

        {status === "ready" && threads.length > 0 && (
          <Threads>
            {threads.map(th => (
              <li key={th.id}>
                <ThreadLink
                  href={`/chat/${th.id}`}
                  title={th.title}
                  aria-current={th.id === activeId ? "page" : undefined}
                >
                  <Clamp>{th.title}</Clamp>
                  <small>{th.updatedLabel}</small>
                </ThreadLink>
              </li>
            ))}
          </Threads>
        )}
      </Nav>
      {drawerOpen && <Scrim aria-hidden="true" onClick={onCloseDrawer} />}
    </>
  )
}
