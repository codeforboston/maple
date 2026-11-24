import { useTranslation } from "next-i18next"
import styled, { keyframes } from "styled-components"

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.92rem;
  color: var(--maple-text-strong);
`

const Done = styled.span`
  display: flex;
  align-items: center;
  gap: var(--maple-space-sm);
  color: var(--maple-text-muted);
  font-size: 0.86rem;

  svg {
    width: 16px;
    height: 16px;
    flex: none;
    color: var(--maple-testimony-support);
  }
`

const Current = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
`

// The one authored motion: orange only for the working state.
const Ring = styled.span`
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid var(--maple-color-gray-subtle-border);
  border-top-color: var(--maple-brand-accent);
  border-right-color: var(--maple-brand-accent);
  animation: ${spin} 0.9s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`

const StaticLabel = styled.span`
  display: none;

  @media (prefers-reduced-motion: reduce) {
    display: inline;
  }
`

const Check = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3.5 8.5l3 3 6-7" />
  </svg>
)

/**
 * Progress while the agent works: finished steps as ✓ lines, the current step beside the spinner.
 * Polite live region, so the status line is announced, never streamed tokens.
 */
export function WorkingSpinner({
  done = [],
  current
}: {
  done?: string[]
  current: string
}) {
  const { t } = useTranslation("chat")
  return (
    <Wrap role="status" aria-live="polite">
      {done.map(step => (
        <Done key={step}>
          <Check />
          {step}
        </Done>
      ))}
      <Current>
        <Ring aria-hidden="true" />
        <StaticLabel>{t("working.label")} </StaticLabel>
        {current}
      </Current>
    </Wrap>
  )
}
