import {
  CurrentRefinements,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox,
  SortBy
} from "@alexjball/react-instantsearch-hooks-web"
import { SortByItem } from "instantsearch.js/es/connectors/sort-by/connectSortBy"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"
import { Col, Row } from "../bootstrap"
import { BillHit } from "./BillHit"
import { getServerConfig, SatelliteCustomization } from "./common"
import { SearchErrorBoundary } from "./SearchErrorBoundary"
import { useRefinements } from "./useRefinements"

const searchClient = new TypesenseInstantSearchAdapter({
  server: getServerConfig(),
  additionalSearchParameters: {
    query_by: "number,title,body",
    exclude_fields: "body"
  }
}).searchClient

const soryByItems: SortByItem[] = [
  { label: "Relevance", value: "bills" },
  { label: "Testimony Count", value: "bills/sort/testimonyCount:desc" },
  {
    label: "Cosponsor Count",
    value: "bills/sort/cosponsorCount:desc"
  },
  { label: "Next Hearing Date", value: "bills/sort/nextHearingAt:desc" },
  { label: "Latest Testimony", value: "bills/sort/latestTestimonyAt:desc" }
]

export const BillSearch = () => (
  <SearchErrorBoundary>
    <InstantSearch indexName="bills" searchClient={searchClient} routing>
      <SearchLayout />
    </InstantSearch>
  </SearchErrorBoundary>
)

const SearchLayout = () => {
  const refinements = useRefinements()
  return (
    <SatelliteCustomization>
      <Row>
        <SearchBox placeholder="Search For Bills" className="mt-2" />
      </Row>
      <Row>
        {refinements.options}
        <Col className="d-flex flex-column">
          <div className="d-flex">
            <SortBy items={soryByItems} />
            {refinements.show}
            <CurrentRefinements />
          </div>
          <Hits hitComponent={BillHit} />
          <Pagination className="mx-auto mt-2 mb-3" />
        </Col>
      </Row>
    </SatelliteCustomization>
  )
}
