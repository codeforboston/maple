import { PropsWithChildren } from "react"
import styled from "styled-components"

export type Width = "narrow" | "medium" | "wide" | "xwide"

export const maxWidths: Record<Width, string> = {
  narrow: "48rem", // 768px — process page
  medium: "56rem", // 896px — testimony page
  wide: "64rem", // 1024px — hub
  // 1280px: the bill and hearing explorers
  xwide: "80rem"
}

/* Learn and About keep Nunito for text, with Lexend only where a heading asks
   for it (--maple-font-heading). The rest of the site sets all text in Lexend
   (styles/bootstrap.scss). */
const Page = styled.div`
  background-color: var(--maple-surface-learn);
  min-height: 100vh;

  *:root & {
    --bs-font-sans-serif: var(--maple-font-body);
    --bs-body-font-family: var(--maple-font-body);
    font-family: var(--maple-font-body);

    /* On the section's darker ground, borders a touch darker too (0.12
       elsewhere). Both are set here, since the card edge takes its value
       where it is defined. */
    --maple-surface-border: rgba(15, 23, 42, 0.16);
    --maple-card-edge: rgba(15, 23, 42, 0.16);
  }
`

/* On desktop: the page in the "wide" column, whatever width the page asks
   for, with reading text a step larger. Pages that pass enlarge={false} keep
   their own width and sizes (the legislative process page). */
const Inner = styled.div<{ $width: Width }>`
  max-width: ${p => maxWidths[p.$width]};
  margin: 0 auto;
  padding: 3.25rem 2rem 3.5rem;

  @media (max-width: 36rem) {
    padding: 1.75rem 1rem 2rem;
  }

  @media (min-width: 992px) {
    *:root &[data-enlarge="true"] {
      max-width: ${maxWidths.wide};
      /* Reading text a step larger. Text that sets no size of its own takes
         the base; components whose text is set smaller read the two sizes
         below and keep their own size everywhere else. */
      font-size: 1.0625rem;
      --learn-text: 1.0625rem;
      --learn-small-text: 1rem;
    }
  }
`

/**
 * Page shell shared by every page in the Learn section: the section background
 * and a width-constrained column. Maple's Navbar and Footer are applied
 * separately by `applyLayout` in components/page.tsx.
 */
export const LearnLayout = ({
  width = "medium",
  enlarge = true,
  children
}: PropsWithChildren<{ width?: Width; enlarge?: boolean }>) => (
  <Page className="maple-learn-page">
    <Inner $width={width} data-enlarge={enlarge}>
      {children}
    </Inner>
  </Page>
)

export default LearnLayout
