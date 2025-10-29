import { Hit } from "instantsearch.js"
import { useInstantSearch } from "react-instantsearch"
import { SearchPage } from "../shared"
import { HearingHit } from "./HearingHit"
import {
  CURRENT_COURT_NUMBER,
  formatCourtFilterLabel,
  formatCourtSubtitle
} from "../courtSessions"
import { useMemo } from "react"

/* carbon copy of type in functions/src/hearings/search.ts */
type HearingSearchRecord = {
  id: string
  eventId: number
  title: string
  description?: string
  startsAt: number
  month: string
  year: number
  committeeCode?: string
  committeeName?: string
  locationName?: string
  locationCity?: string
  chairNames: string[]
  agendaTopics: string[]
  billNumbers: string[]
  billSlugs: string[]
  court: number
  hasVideo: boolean
}

export type HearingHitData = Hit<HearingSearchRecord>

const sortOptions = [
  {
    labelKey: "sort_by.earliest_hearing",
    value: "hearings/sort/startsAt:asc"
  },
  {
    labelKey: "sort_by.latest_hearing",
    value: "hearings/sort/startsAt:desc"
  },
  {
    labelKey: "sort_by.relevance",
    value: "hearings/sort/_text_match:desc,startsAt:asc"
  }
]

export const HearingSearch = () => (
  <SearchPage
    searchType="hearing"
    header={<HearingSearchHeader />}
    initialUiState={{
      [sortOptions[0].value]: {
        refinementList: { court: [String(CURRENT_COURT_NUMBER)] }
      }
    }}
    searchParameters={{
      query_by:
        "title,description,agendaTopics,billNumbers,chairNames,locationName,locationCity",
      sort_by: "startsAt:asc"
    }}
    hitComponent={HearingHit}
    filterPanelConfig={{
      filters: [
        {
          attribute: "court",
          transformItems: items =>
            items
              .map(item => ({
                ...item,
                label: formatCourtFilterLabel(parseInt(item.value, 10))
              }))
              .sort((a, b) => Number(b.value) - Number(a.value))
        },
        { attribute: "month" },
        { attribute: "year" },
        { attribute: "committeeName" },
        {
          attribute: "chairNames",
          transformItems: items =>
            items.sort((a, b) => a.label.localeCompare(b.label))
        }
      ]
    }}
    sortOptions={sortOptions}
  />
)

const HearingSearchHeader = () => {
  const { indexUiState } = useInstantSearch()

  const subtitle = useMemo(() => {
    const selectedCourt = indexUiState?.refinementList?.court?.[0]
    const parsed = Number.parseInt(selectedCourt ?? "", 10)
    const courtNumber = Number.isNaN(parsed) ? CURRENT_COURT_NUMBER : parsed
    return formatCourtSubtitle(courtNumber)
  }, [indexUiState?.refinementList?.court])

  return <p className="text-secondary mb-3">{subtitle}</p>
}
