import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { formatBillNumber } from "./ChamberChip"

export type ToolStep = {
  label: string
  items?: { id: string; title: string | null }[]
}

const Details = styled.details`
  margin: 0 0 12px;
  font-size: 0.88rem;
  color: var(--maple-text-muted);

  &[open] .caret {
    transform: rotate(90deg);
  }
`

const Summary = styled.summary`
  list-style: none;
  display: inline-flex;
  align-items: center;
  gap: var(--maple-space-sm);
  min-height: 44px;
  cursor: pointer;
  padding: 4px 8px 4px 4px;
  margin-left: -4px;
  border-radius: var(--maple-radius-md);

  &::-webkit-details-marker {
    display: none;
  }

  &:hover {
    background: var(--maple-chat-tint);
    color: var(--maple-text-strong);
  }

  &:focus-visible {
    outline: 3px solid var(--maple-chat-focus);
    outline-offset: 2px;
  }

  .caret {
    width: 16px;
    height: 16px;
    color: var(--maple-brand-primary);
    transition: transform var(--maple-transition-base);
  }

  @media (max-width: 820px) {
    .long {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .caret {
      transition: none;
    }
  }
`

const Step = styled.span`
  display: block;
  margin: 6px 0 0 26px;
`

const List = styled.ol`
  margin: 8px 0 4px 26px;
  padding: 0;
  display: grid;
  gap: 4px;

  b {
    color: var(--maple-text-strong);
    font-variant-numeric: tabular-nums;
  }
`

/** The finished turn's tool activity as one quiet line; expands to what was retrieved. */
export function ToolDisclosure({
  summary,
  steps
}: {
  summary: string
  steps: ToolStep[]
}) {
  const { t } = useTranslation("chat")
  return (
    <Details>
      <Summary>
        <svg
          className="caret"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 4l4 4-4 4" />
        </svg>
        <span>
          <span className="long">{t("disclosure.searchedPrefix")}</span>
          {summary}
        </span>
      </Summary>
      {steps.map(step => (
        <div key={step.label}>
          <Step>{step.label}</Step>
          {step.items && step.items.length > 0 && (
            <List>
              {step.items.map(item => (
                <li key={item.id}>
                  <b>{formatBillNumber(item.id)}</b> {item.title?.trim()}
                </li>
              ))}
            </List>
          )}
        </div>
      ))}
    </Details>
  )
}
