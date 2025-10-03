import { Hit } from "instantsearch.js"
import { SearchPage } from "../base"
import { HearingHit } from "./HearingHit"

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
  chairNames?: string[]
  agendaTopics?: string[]
  billNumbers?: string[]
  billSlugs?: string[]
  hasVideo: boolean
}

export type HearingHitData = Hit<HearingSearchRecord>

export const HearingSearch = () => (
  <SearchPage
    searchType="hearing"
    searchParameters={{
      query_by:
        "title,description,agendaTopics,billNumbers,chairNames,locationName,locationCity",
      sort_by: "startsAt:asc"
    }}
    hitComponent={HearingHit}
    filterPanelConfig={{
      filters: [
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
    sortOptions={[
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
    ]}
  />
)
