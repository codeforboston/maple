import styled from "styled-components"

/** A section's title row on Submit Testimony: the title, an h3 in Lexend
 * rather than Bootstrap's heading Nunito at 1.25rem, and anything for the far
 * right. */
export const SectionHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    font-family: var(--maple-font-heading);
    font-size: 1.25rem;
  }
`
