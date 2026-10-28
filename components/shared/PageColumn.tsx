import styled from "styled-components"
import { maxWidths, Width } from "components/learn/LearnLayout"

/**
 * A centred content column at one of the Learn section's widths, with 2rem of
 * padding each side inside it, for pages that are not built on LearnLayout.
 * The widths come from components/learn/LearnLayout.tsx so the two line up.
 */
export const PageColumn = styled.div<{ $width: Width }>`
  max-width: ${p => maxWidths[p.$width]};
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 36rem) {
    padding: 0 1rem;
  }

  /* Room under the navbar before the page title, the same under either bar.
     Beats the pages' own mt-3, which Bootstrap marks important. */
  && {
    margin-top: 2rem !important;
  }

  /* Under a neutral bar that is not pinned (on these pages, only the mobile
     bar), the bar has no shadow and shares the page's ground, so less room:
     the bar's own padding already sets the title apart. */
  .main-navbar:not(.sticky-top):is(
      [data-navbar-variant="neutral"],
      *:root [data-navbar-variant="auto"]
    )
    ~ main
    & {
    margin-top: 1.5rem !important;
  }

  /* The page title gets more room below it before the search box, in place
     of Bootstrap's default 0.5rem. */
  *:root & > h1 {
    margin-bottom: 1.5rem;
  }
`
