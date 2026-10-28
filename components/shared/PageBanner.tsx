import { ReactNode } from "react"
import { DigitalDemocracyOnly, MapleOnly } from "./SkinOnly"
import { Banner, SlimBanner } from "./StyledSharedComponents"

/**
 * A notice across the top of a page: main's large orange Banner under Maple,
 * and under Digital Democracy, Mixed and Statehouse the slim note the lobbying
 * explorer uses for its beta notice (SlimBanner). Both are rendered and the
 * skin shows one, so nothing swaps in after the page loads.
 */
export function PageBanner({ children }: { children: ReactNode }) {
  return (
    <>
      <MapleOnly>
        <Banner>{children}</Banner>
      </MapleOnly>
      <DigitalDemocracyOnly>
        <SlimBanner>{children}</SlimBanner>
      </DigitalDemocracyOnly>
    </>
  )
}
