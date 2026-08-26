import { Hit } from "instantsearch.js"
import { useInstantSearch } from "react-instantsearch"
import { SearchPage, SortOptionInput } from "../shared"
import { HearingHit } from "./HearingHit"
import {
  CURRENT_COURT_NUMBER,
  formatCourtFilterLabel,
  formatCourtSubtitle
} from "../courtSessions"
import { useMemo, useRef } from "react"
import type { HearingSearchRecord } from "functions/src/hearings/types"
import { hearingsRelevanceSort, hearingsSearchParams } from "../searchParams"

export type HearingHitData = Hit<HearingSearchRecord>

/** Relevance searches every hearing, past and upcoming. Clearing the window
 * explicitly is load-bearing: SortBy calls useConfigure(selected.configure ?? {}),
 * so the previously selected option's startsAt bound has to be overwritten.
 */
const noTimeWindow: SortOptionInput["configure"] = { numericRefinements: {} }

const useHearingSort = (): SortOptionInput[] => {
  const now = useRef(new Date().getTime())
  return useMemo<SortOptionInput[]>(
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
        // "upcoming" already owns startsAt:asc, and react-instantsearch needs a
        // unique index name per sort option — eventId is the tiebreak that
        // makes this one distinct without changing the ordering users see.
        labelKey: "sort_by.past_oldest",
        value: "hearings/sort/startsAt:asc,eventId:asc",
        configure: {
          numericRefinements: {
            startsAt: {
              "<=": [now.current]
            }
          }
        }
      },
      {
        // The only sort under which text ranking is observable.
        labelKey: "sort_by.relevance",
        value: `hearings/sort/${hearingsRelevanceSort}`,
        configure: noTimeWindow
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
      header={<HearingSearchHeader />}
      currentRefinementsProps={{ excludedAttributes: ["startsAt"] }}
      initialUiState={{
        [sortOptions[0].value]: {
          refinementList: {
            court: [String(CURRENT_COURT_NUMBER)],
            hasVideo: ["true"]
          }
        }
      }}
      searchParameters={hearingsSearchParams}
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
