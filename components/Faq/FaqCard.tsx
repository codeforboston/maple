import { useId, useState } from "react"
import styled from "styled-components"
import { ChevronDownIcon } from "../learn/icons"
import { FaqQandAButton } from "./FaqQandAButton"

type faqCardProps = {
  heading: string
  qAndAs: { disabled?: boolean; question: string; answer: string }[]
}

const Card = styled.section`
  background: var(--maple-surface-base);
  border-radius: var(--maple-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  overflow: hidden;

  > button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1.5rem 2rem;
    background: none;
    border: 0;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--bs-blue);
      outline-offset: -2px;
    }
  }

  h2 {
    font-family: var(--maple-font-heading);
    font-weight: 700;
    color: var(--bs-blue);
    font-size: 1.125rem;
    margin: 0;
  }

  /* Chevron size and animation copied from the Why Use MAPLE toggles: a single
     chevron that rotates rather than swapping icons. No hover circle here --
     the cursor alone is enough to signal the whole header is clickable. */
  .chevron {
    flex-shrink: 0;
    color: var(--maple-text-muted);
    transition: transform 0.25s ease;
  }

  > button[aria-expanded="true"] .chevron {
    transform: rotate(180deg);
  }

  @media (prefers-reduced-motion: reduce) {
    .chevron {
      transition: none;
    }
  }

  /* Expand/collapse animation copied from the Why Use MAPLE toggles: the row
     animates between 0fr and 1fr rather than mounting instantly. The inner
     element clips so the padding collapses with it. */
  .items {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    visibility: hidden;
    transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.2s ease, visibility 0s linear 0.35s;
  }

  .items[data-open="true"] {
    grid-template-rows: 1fr;
    opacity: 1;
    visibility: visible;
    transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.25s ease 0.08s, visibility 0s;
  }

  /* No padding here: overflow: hidden only clips overflowing content, not this
     element's own padding, so any padding placed directly on it would still
     render at full size even while collapsed. Padding lives on .items-content
     instead, which is what actually gets clipped away. */
  .items-inner {
    min-height: 0;
    overflow: hidden;
  }

  /* Horizontal inset lives on each question row instead (see FaqQandAButton),
     so the divider and the hover background share the same bounds as the row's
     own padding rather than the container's. */
  .items-content {
    padding: 0 0 1rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .items {
      transition: none;
    }
  }

  @media (max-width: 36rem) {
    > button {
      padding: 1.25rem 1.25rem;
    }

    .items-content {
      padding: 0 0 0.75rem;
    }
  }
`

/** A collapsible category of questions. Categories start expanded. */
export const FaqCard = ({ heading, qAndAs }: faqCardProps) => {
  const [open, setOpen] = useState(true)
  const panelId = useId()
  const questions = qAndAs.filter(q => !q.disabled)

  return (
    <Card>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(o => !o)}
      >
        <h2>{heading ?? ""}</h2>
        <ChevronDownIcon
          className="chevron"
          aria-hidden="true"
          sx={{ fontSize: "1.25rem" }}
        />
      </button>
      <div className="items" id={panelId} data-open={open}>
        <div className="items-inner">
          <div className="items-content">
            {questions.map(q => (
              <FaqQandAButton
                key={q.question}
                question={q.question}
                answer={q.answer}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
