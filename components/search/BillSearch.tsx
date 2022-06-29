import {
  CurrentRefinements,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox
} from "@alexjball/react-instantsearch-hooks-web"
import styled from "styled-components"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"
import { Col, Row } from "../bootstrap"
import { BillHit } from "./BillHit"
import { getServerConfig } from "./common"
import { ResultCount } from "./ResultCount"
import { SearchContainer } from "./SearchContainer"
import { SearchErrorBoundary } from "./SearchErrorBoundary"
import { initialSortByValue, SortBy } from "./SortBy"
import { useRefinements } from "./useRefinements"
import { useRouting } from "./useRouting"

const searchClient = new TypesenseInstantSearchAdapter({
  server: getServerConfig(),
  additionalSearchParameters: {
    query_by: "number,title,body",
    exclude_fields: "body"
  }
}).searchClient

export const BillSearch = () => (
  <SearchErrorBoundary>
    <InstantSearch
      indexName={initialSortByValue}
      searchClient={searchClient}
      routing={useRouting()}
    >
      <Layout />
    </InstantSearch>
  </SearchErrorBoundary>
)

const RefinementRow = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const Layout = () => {
  const refinements = useRefinements()
  return (
    <SearchContainer>
      <Row>
        <SearchBox placeholder="Search For Bills" className="mt-2 mb-3" />
      </Row>
      <Row>
        {refinements.options}
        <Col className="d-flex flex-column">
          <RefinementRow>
            <ResultCount className="flex-grow-1 m-1" />
            <SortBy />
            {refinements.show}
          </RefinementRow>
          <CurrentRefinements className="mt-2 mb-2" />
          <Hits hitComponent={BillHit} />
          <Pagination className="mx-auto mt-2 mb-3" />
        </Col>
      </Row>
    </SearchContainer>
  )
}
