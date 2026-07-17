import { useId, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import styled from "styled-components"
import { Internal } from "../links"

type faqQandAProps = {
  question: string
  answer: string
}

/* Full width: the divider spans the whole card, and the hover background
   (painted on the button) reaches the same edges. The inset from the card's
   edges is the button's own horizontal padding, not a margin on this row.

   An inset-divider alternative was tried and set aside (kept below, commented
   out, in case it's wanted again): a wrapped line that fills only its parent's
   content box, so padding on the wrapper shortens the visible line without a
   margin -- border-top can't be inset this way, since a border draws at the
   outer edge of the padding box regardless of that box's own padding. */
const Item = styled.div`
  border-top: 1px solid var(--maple-surface-border);

  /* .divider-wrap {
    padding: 0 2rem;
  }

  .divider-line {
    height: 1px;
    background-color: var(--maple-surface-border);
  }

  @media (max-width: 36rem) {
    .divider-wrap {
      padding: 0 1.25rem;
    }
  } */

  button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 1.125rem 2rem;
    background: none;
    border: 0;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: var(--maple-surface-muted);
    }

    &:focus-visible {
      outline: 2px solid var(--bs-blue);
      outline-offset: 2px;
    }
  }

  @media (max-width: 36rem) {
    button {
      padding: 1.125rem 1.25rem;
    }
  }

  .badge {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: var(--maple-radius-pill);
    background: var(--maple-surface-learn);
    color: var(--maple-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .question {
    flex: 1;
    min-width: 0;
    font-weight: 600;
    color: var(--maple-text-strong);
    line-height: 1.45;
  }

  .answer {
    color: var(--maple-text-muted);
    line-height: 1.6;
    /* The answer sits outside the button, so its indent has to repeat the
       button's own left padding (2rem) plus badge width (1.5rem) and gap
       (0.875rem) to land under the question text; the right margin mirrors the
       button's right padding. */
    margin: 0 2rem 1.125rem 4.375rem;
  }

  .answer a {
    color: var(--bs-blue);
    text-decoration: underline;
  }

  @media (max-width: 36rem) {
    .answer {
      margin: 0 1.25rem 1.125rem 3.625rem;
    }
  }
`

/**
 * A single question that expands to reveal its answer. The one about supporting
 * MAPLE links to the support page, so that answer is composed rather than plain
 * text.
 */
export const FaqQandAButton = ({ question, answer }: faqQandAProps) => {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  const isSupport = question === "How can I support MAPLE?"

  return (
    <Item>
      {/* Inset-divider alternative -- pairs with the commented CSS above. */}
      {/* <div className="divider-wrap">
        <div className="divider-line" />
      </div> */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(o => !o)}
      >
        {/* Same size as the Why Use MAPLE check icons, in the same 1.5rem badge. */}
        <span className="badge" aria-hidden="true">
          {open ? (
            <RemoveIcon sx={{ fontSize: "0.9375rem" }} />
          ) : (
            <AddIcon sx={{ fontSize: "0.9375rem" }} />
          )}
        </span>
        <span className="question">{question}</span>
      </button>
      {open && (
        <p className="answer" id={panelId}>
          {answer}
          {isSupport && (
            <>
              {" "}
              {/* eslint-disable-next-line i18next/no-literal-string */}
              <Internal href="/about/support-maple">this page</Internal>.
            </>
          )}
        </p>
      )}
    </Item>
  )
}
