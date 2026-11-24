import { useTranslation } from "next-i18next"
import Link from "next/link"
import { Button } from "react-bootstrap"
import styled from "styled-components"
import { billSearchUrl, external } from "./links"
import { ArrowIcon } from "./Icons"

const Empty = styled.section`
  max-width: 560px;
  margin: clamp(24px, 10vh, 96px) auto 0;
  text-align: center;

  h1 {
    margin: 0 0 8px;
    color: var(--maple-text-strong);
    font-size: clamp(1.4rem, 3.5vw, 1.8rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
    text-wrap: balance;
  }

  p {
    margin: 0 0 24px;
    color: var(--maple-text-body);
  }
`

const Starters = styled.ul`
  list-style: none;
  margin: 0 0 20px;
  padding: 0;
  display: grid;
  gap: 10px;

  .btn {
    width: 100%;
    min-height: 44px;
    text-align: left;
    border-radius: var(--maple-radius-lg);
    border-color: var(--maple-surface-border);
    background: var(--maple-surface-base);
    color: var(--maple-text-strong);
  }

  .btn:hover {
    background: var(--maple-chat-tint);
    border-color: var(--maple-border-accent-strong);
  }

  .btn:focus-visible {
    outline: 3px solid var(--maple-chat-focus);
    outline-offset: 2px;
  }
`

/** /chat/new: the empty state with starter questions. */
export function EmptyChat({
  starters,
  onStarter,
  resumeHref
}: {
  starters: string[]
  onStarter: (question: string) => void
  /** Returning user: their latest thread. */
  resumeHref?: string
}) {
  const { t } = useTranslation("chat")
  return (
    <Empty>
      <h1>{t("empty.heading")}</h1>
      <p>{t("empty.scope")}</p>
      <Starters aria-label={t("empty.startersLabel")}>
        {starters.map(q => (
          <li key={q}>
            <Button variant="light" onClick={() => onStarter(q)}>
              {q}
            </Button>
          </li>
        ))}
      </Starters>
      {resumeHref && <Link href={resumeHref}>{t("empty.resume")}</Link>}
    </Empty>
  )
}

const Note = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  padding: 12px 16px;
  border-radius: var(--maple-radius-lg);
  background: var(--maple-color-gray-subtle-bg);
  color: var(--maple-text-strong);

  .btn {
    min-height: 44px;
  }
`

/** Failed after retries. Any partial answer stays above this, marked "(incomplete)". */
export function AnswerFailed({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation("chat")
  return (
    <Note role="alert">
      <span>{t("answer.failed")}</span>
      <Button variant="outline-secondary" size="sm" onClick={onRetry}>
        {t("answer.retry")}
      </Button>
    </Note>
  )
}

/** Monthly budget reached. The page also disables the composer with budget.composerDisabled. */
export function BudgetReached() {
  const { t } = useTranslation("chat")
  return (
    <Note role="status">
      <span>{t("budget.reached")}</span>
      <a href={billSearchUrl()} {...external}>
        {t("budget.browseBills")}
      </a>
    </Note>
  )
}

const Quiet = styled.p`
  margin: 4px 0 0;
  font-size: 0.86rem;
  color: var(--maple-text-muted);
`

/** No relevant results, under the agent's own "nothing matched" answer: offers MAPLE's keyword bill search. */
export function NoResultsNote({ query }: { query: string }) {
  const { t } = useTranslation("chat")
  return (
    <Quiet>
      {t("answer.noResults")}{" "}
      <a href={billSearchUrl(query)} {...external}>
        {t("answer.searchAll")} <ArrowIcon />
      </a>
    </Quiet>
  )
}
