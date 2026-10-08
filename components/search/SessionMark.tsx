import { useMemo } from "react"
import { useInstantSearch } from "react-instantsearch"
import styled from "styled-components"
import { CURRENT_COURT_NUMBER, formatCourtSubtitle } from "./courtSessions"

/**
 * What marks an explorer as following the legislative session: the session
 * line under the title (hearings), and the statehouse above the search box's
 * right end (hearings, with Regular Background only;
 * components/search/shared/SearchPage.tsx takes it as controlsArt). Shared, so any session page places them the
 * same way.
 */

/** The session being browsed, such as "Current Session: 2025 - 2026", from
 * the court filter. Reads only the first court selected. Render it inside
 * the search, just above the search box. */
export const SessionSubtitle = () => {
  const { indexUiState } = useInstantSearch()

  const subtitle = useMemo(() => {
    const selectedCourt = indexUiState?.refinementList?.court?.[0]
    const parsed = Number.parseInt(selectedCourt ?? "", 10)
    const courtNumber = Number.isNaN(parsed) ? CURRENT_COURT_NUMBER : parsed
    return formatCourtSubtitle(courtNumber)
  }, [indexUiState?.refinementList?.court])

  return <p className="text-secondary mb-3">{subtitle}</p>
}

/** The statehouse, standing just above the search box. Render it inside the
 * search box's container, which must be positioned. */
export const Statehouse = ({
  regularBackgroundOnly = false
}: {
  /** Show it only with Regular Background (data-maple-art="off"), in place
   * of the page's other artwork, rather than alongside it. */
  regularBackgroundOnly?: boolean
}) => (
  <StatehouseImg
    src="/statehouse.svg"
    alt=""
    aria-hidden="true"
    $regularBackgroundOnly={regularBackgroundOnly}
  />
)

/* Its right edge lined up with the box's right edge. Desktop only, like the
   rest of the explorers' artwork. */
const StatehouseImg = styled.img<{ $regularBackgroundOnly: boolean }>`
  display: none;

  /* Digital Democracy and Mixed only, while explorer art is on
     (data-maple-art), or only while it is off; the Maple skin has none. */
  @media (min-width: 992px) {
    ${p =>
      p.$regularBackgroundOnly
        ? '[data-maple-theme="dd"][data-maple-art="off"]'
        : '[data-maple-theme="dd"]:not([data-maple-art="off"])'}
    & {
      display: block;
    }
    position: absolute;
    bottom: calc(100% + 0.5rem);
    right: 0;
    width: 11rem;
    height: auto;
    pointer-events: none;
  }
`
