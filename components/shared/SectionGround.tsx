import { createGlobalStyle } from "styled-components"

/**
 * Under Digital Democracy (not Mixed), puts the page on the Learn and About
 * ground (--maple-surface-learn), for pages outside the Learn layout that take
 * the same look. Its navbar follows from components/Navbar.tsx (SECTION_GROUND_PAGES).
 */
export const SectionGround = createGlobalStyle`
  [data-maple-theme="dd"]:not([data-maple-nav="mixed"]) main#main-content {
    background-color: var(--maple-surface-learn);
    /* Its own stacking context, so artwork set behind the page's blocks
       (z-index -1, as on the explorers) draws over this ground, not under it. */
    isolation: isolate;
  }
`
