import { Hit } from "instantsearch.js"
import { SearchPage } from "../shared"
import { HearingHit } from "./HearingHit"
import { SessionSubtitle, Statehouse } from "../SessionMark"
import { CURRENT_COURT_NUMBER, formatCourtFilterLabel } from "../courtSessions"
import { useMemo, useRef } from "react"

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

const useHearingSort = () => {
  const now = useRef(new Date().getTime())
  return useMemo(
    () => [
      {
        labelKey: "sort_by.past_newest",
        value: "hearings/sort/startsAt:desc",
        configure: {
          numericRefinements: {
            startsAt: {
              "<=": [now.current]
            }
          }
        }
      },
      {
        labelKey: "sort_by.upcoming",
        value: "hearings/sort/startsAt:asc",
        configure: {
          numericRefinements: {
            startsAt: {
              ">=": [now.current]
            }
          }
        }
      },
      {
        labelKey: "sort_by.past_oldest",
        value: "hearings/sort/startsAt:asc,startsAt:asc",
        configure: {
          numericRefinements: {
            startsAt: {
              "<=": [now.current]
            }
          }
        }
      }
    ],
    []
  )
}

export const HearingSearch = () => {
  const sortOptions = useHearingSort()
  return (
    <SearchPage
      searchType="hearing"
      header={<SessionSubtitle />}
      // Above the search box, with Regular Background only.
      controlsArt={<Statehouse regularBackgroundOnly />}
      currentRefinementsProps={{ excludedAttributes: ["startsAt"] }}
      initialUiState={{
        [sortOptions[0].value]: {
          refinementList: {
            court: [String(CURRENT_COURT_NUMBER)],
            hasVideo: ["true"]
          }
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
          {
            attribute: "hasVideo",
            transformItems: items =>
              items.map(item => ({
                ...item,
                label: item.value === "true" ? "Yes" : "No"
              }))
          },
          { attribute: "committeeName" },
          { attribute: "month" },
          { attribute: "year" },
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
}
