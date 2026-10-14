import { useMemo } from "react"
import { useInstantSearch } from "react-instantsearch"
import { CURRENT_COURT_NUMBER, formatCourtSubtitle } from "./courtSessions"

/**
 * What marks an explorer as following the legislative session: the session
 * line under the title (hearings). Shared, so any session page places it the
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
