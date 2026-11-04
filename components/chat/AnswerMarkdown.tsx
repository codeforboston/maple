import { useTranslation } from "next-i18next"
import { Children, type ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import styled from "styled-components"
import { external, MAPLE_SITE } from "./links"

/** Paragraphs, bold, links and short bullet lists only. Anything else is unwrapped to plain text. */
export const ALLOWED_ELEMENTS = ["p", "strong", "a", "ul", "li"]
export const MAX_LIST_ITEMS = 5

const Prose = styled.div`
  color: var(--maple-text-body);
  font-size: 1.02rem;
  line-height: 1.62;

  p,
  ul {
    margin: 0 0 12px;
    max-width: 68ch;
  }

  strong {
    color: var(--maple-text-strong);
  }

  a {
    color: var(--maple-brand-primary);
    text-underline-offset: 3px;
  }

  a:focus-visible {
    outline: 3px solid var(--maple-chat-focus);
    outline-offset: 2px;
    border-radius: var(--maple-radius-sm);
  }
`

const Incomplete = styled.span`
  color: var(--maple-text-muted);
  font-style: italic;
`

export function CappedList({ children }: { children?: ReactNode }) {
  // react-markdown passes "\n" text nodes between items; count only the items.
  const items = Children.toArray(children).filter(c => typeof c !== "string")
  return <ul>{items.slice(0, MAX_LIST_ITEMS)}</ul>
}

/** Only MAPLE bill pages, never a URL the model copied from third-party text. */
/** The answer as screen readers should hear it: link text without URLs, no ** or list markers. */
export const plainText = (md: string) =>
  md
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|__/g, "")
    .replace(/^\s*[-*]\s+/gm, "")

export const isBillPath = (href?: string) =>
  !!href && /^\/bills\/\d+\/[A-Z0-9]+$/.test(href)

export function BillLinkOnly({
  href,
  children
}: {
  href?: string
  children?: ReactNode
}) {
  return isBillPath(href) ? (
    <a href={MAPLE_SITE + href} {...external}>
      {children}
    </a>
  ) : (
    <>{children}</>
  )
}

export function AnswerMarkdown({
  text,
  incomplete = false
}: {
  text: string
  incomplete?: boolean
}) {
  const { t } = useTranslation("chat")
  return (
    <Prose>
      <ReactMarkdown
        allowedElements={ALLOWED_ELEMENTS}
        unwrapDisallowed
        components={{
          ul: ({ node: _node, ...props }) => <CappedList {...props} />,
          a: ({ node: _node, href, children }) => (
            <BillLinkOnly href={href}>{children}</BillLinkOnly>
          )
        }}
      >
        {text}
      </ReactMarkdown>
      {incomplete && <Incomplete>{t("answer.incomplete")}</Incomplete>}
    </Prose>
  )
}
