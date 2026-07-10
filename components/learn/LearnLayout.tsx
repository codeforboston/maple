import { PropsWithChildren } from "react"
import styled from "styled-components"

type Width = "narrow" | "medium" | "wide"

const maxWidths: Record<Width, string> = {
  narrow: "48rem", // 768px — process page
  medium: "56rem", // 896px — testimony page
  wide: "64rem" // 1024px — hub
}

const Page = styled.div`
  background-color: var(--maple-surface-learn);
  min-height: 100vh;
`

const Inner = styled.div<{ $width: Width }>`
  max-width: ${p => maxWidths[p.$width]};
  margin: 0 auto;
  padding: 3.5rem 2rem;

  @media (max-width: 36rem) {
    padding: 2rem 1rem;
  }
`

/**
 * Page shell shared by every page in the Learn section: the section background
 * and a width-constrained column. Maple's Navbar and Footer are applied
 * separately by `applyLayout` in components/page.tsx.
 */
export const LearnLayout = ({
  width = "medium",
  children
}: PropsWithChildren<{ width?: Width }>) => (
  <Page>
    <Inner $width={width}>{children}</Inner>
  </Page>
)

export default LearnLayout
