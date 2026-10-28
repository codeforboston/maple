import styled, { createGlobalStyle } from "styled-components"

/**
 * The statehouse standing on the footer's top edge, at the left of the
 * window, behind the page's content. Placed against the page's main area,
 * which stretches to meet the footer however short the page is
 * (components/layout.tsx). Desktop widths only.
 */
export const FooterStatehouse = () => (
  <>
    <MainIsPositioned />
    <Statehouse src="/statehouse.svg" alt="" aria-hidden="true" />
  </>
)

/* The statehouse is placed against main, so main must be positioned, and it
   reaches past main's left edge, which clips it sideways (clip, unlike
   hidden, leaves sticky elements working). Only on pages that show it. */
const MainIsPositioned = createGlobalStyle`
  main#main-content {
    position: relative;
    overflow-x: clip;
  }
`

const Statehouse = styled.img`
  display: none;

  @media (min-width: 992px) {
    display: block;
  }

  position: absolute;
  /* A touch below the footer's edge, its base tucked behind the footer. */
  bottom: calc(-0.5rem + 2px);
  left: -1rem;
  width: 17rem;
  height: auto;
  pointer-events: none;
  /* Behind the page's own blocks, over the page ground. */
  z-index: -1;
`
