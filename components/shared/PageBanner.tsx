import { ReactNode } from "react"
import { SlimBanner } from "./StyledSharedComponents"

/**
 * A notice across the top of a page: the slim note the lobbying explorer uses
 * for its beta notice (SlimBanner).
 */
export function PageBanner({ children }: { children: ReactNode }) {
  return <SlimBanner>{children}</SlimBanner>
}
