import styled from "styled-components"
import { Internal } from "../links"

/** The site's eyebrow, a size down: the mockup sets these at 11px. */
export const Eyebrow = styled.p.attrs((props): { className: string } => ({
  className: `maple-eyebrow m-0 ${props.className ?? ""}`
}))`
  font-size: 0.6875rem;
`

/** The mockup's 1180 column, shared by the conference page and the index. */
export const PageColumn = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 1.25rem 3rem;

  @media (min-width: 576px) {
    padding-left: 2rem;
    padding-right: 2rem;
  }
`

/** The page heading: bold Nunito rather than the heading face, as the mockup
 * sets it. */
export const Title = styled.h1`
  margin: 0;
  font-family: "Nunito", var(--bs-body-font-family);
  font-weight: 700;
  font-size: 1.75rem;
  line-height: 1.2;
  color: var(--maple-brand-primary-strong);
  text-wrap: balance;

  @media (min-width: 700px) {
    font-size: 2.5rem;
  }
`

/** A white block with the page's card radius, as the committee card. */
export const Card = styled.section`
  background: var(--maple-surface-base);
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--maple-radius-xl);
  padding: 1.5rem 2rem 2rem;

  @media (max-width: 575.98px) {
    padding: 1.25rem 1.25rem 1.5rem;
  }
`

export const CardTitle = styled.h2`
  margin: 0 0 1.25rem;
  font-family: var(--maple-font-heading);
  font-weight: 500;
  font-size: 1.375rem;
  line-height: 1.3;
  color: var(--maple-text-strong);
`

/** The link style the mockup gives every link in the page body. */
export const DottedInternal = styled(Internal)`
  font-weight: 600;
  color: var(--maple-brand-primary);
  text-decoration: underline dotted;
  text-underline-offset: 3px;
  &:hover {
    color: var(--maple-brand-primary-strong);
  }
`

/** Party colours, which ring the portraits and fill the map. */
export const partyColor = (party: string) =>
  party === "Democrat"
    ? "#4682d5"
    : party === "Republican"
    ? "#b53333"
    : "#b5b4ae"
