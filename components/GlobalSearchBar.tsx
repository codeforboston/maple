import {
  CurrentRefinements,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox,
  useInstantSearch
} from "@alexjball/react-instantsearch-hooks-web"
import { currentGeneralCourt } from "functions/src/shared"
import { SortByItem } from "instantsearch.js/es/connectors/sort-by/connectSortBy"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"
import { NoResults } from "./search/NoResults"
import { ResultCount } from "./search/ResultCount"
import { SearchContainer } from "./search/SearchContainer"
import { SearchErrorBoundary } from "./search/SearchErrorBoundary"
import { SortBy } from "./search/SortBy"
import { getServerConfig } from "./search/common"
import { useRouting } from "./search/useRouting"

//modify query_by and exclude_fields when connecting to backend
export function GlobalSearchBar() {
  const searchClient = new TypesenseInstantSearchAdapter({
    server: getServerConfig(),
    additionalSearchParameters: {
      query_by: "number,title,body",
      exclude_fields: "body"
    }
  }).searchClient

  const items = [
    {
      label: "Sort by organizations",
      value: "bills/sort/latestTestimonyAt:desc"
    },
    {
      label: "Sort by bill numbers",
      value: "bills/sort/_text_match:desc,testimonyCount:desc"
    },
    {
      label: "Sort by bill names",
      value: "bills/sort/testimonyCount:desc"
    },
    {
      label: "Sort by users",
      value: "bills/sort/cosponsorCount:desc"
    }
  ]

  const initialSortByValue = items[0].value

  return (
    <SearchErrorBoundary>
      <InstantSearch
        searchClient={searchClient}
        indexName={initialSortByValue}
        // routing={}
      >
        <SearchContainer
          style={{ width: "40vw", borderRadius: 80, overflow: "hidden" }}
        >
          <SearchBox placeholder="Search for organizations, bill numbers, bill names, or users" />
        </SearchContainer>
      </InstantSearch>
    </SearchErrorBoundary>
  )
}
