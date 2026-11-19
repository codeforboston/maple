import { useMemo } from "react"
import { useInstantSearch } from "react-instantsearch"
import {
  currentGeneralCourt,
  generalCourts,
  isCurrentCourt
} from "functions/src/shared"

const ordinalSuffix = (value: number) => {
  const mod100 = value % 100
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`
  switch (value % 10) {
    case 1:
      return `${value}st`
    case 2:
      return `${value}nd`
    case 3:
      return `${value}rd`
    default:
      return `${value}th`
  }
}

const formatCourtSubtitle = (number: number) => {
  const court = generalCourts[number]
  if (!court) return `${ordinalSuffix(number)} Session`
  const range = `${court.FirstYear} - ${court.SecondYear}`
  if (isCurrentCourt(number)) {
    return `Current Session: ${range}`
  }
  return `${ordinalSuffix(number)} Session: ${range}`
}

/**
 * What marks an explorer as following the legislative session (hearings): the
 * session being browsed, such as "Current Session: 2025 - 2026", from the
 * court filter. Reads only the first court selected. Render it inside the
 * search, just above the search box. Shared, so any session page places it
 * the same way.
 */
export const SessionSubtitle = () => {
  const { indexUiState } = useInstantSearch()

  const subtitle = useMemo(() => {
    const selectedCourt = indexUiState?.refinementList?.court?.[0]
    const parsed = Number.parseInt(selectedCourt ?? "", 10)
    const courtNumber = Number.isNaN(parsed) ? currentGeneralCourt : parsed
    return formatCourtSubtitle(courtNumber)
  }, [indexUiState?.refinementList?.court])

  return <p className="text-secondary mb-3">{subtitle}</p>
}
