import {
  CurrentRefinements,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox,
  useInstantSearch
} from "@alexjball/react-instantsearch-hooks-web"
import { currentGeneralCourt } from "components/db/common"
import styled from "styled-components"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"
import { Col, Row } from "../bootstrap"
import { BillHit } from "./BillHit"
import { getServerConfig } from "./common"
import { NoResults } from "./NoResults"
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
      initialUiState={{
        [initialSortByValue]: {
          refinementList: { court: [String(currentGeneralCourt)] }
        }
      }}
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

const useSearchStatus = () => {
  const { results } = useInstantSearch()

  if (!results.query) {
    return "loading"
  } else if (results.nbHits === 0) {
    return "empty"
  } else {
    return "results"
  }
}

const Layout = () => {
  const refinements = useRefinements()
  const status = useSearchStatus()
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
          {status === "empty" ? (
            <NoResults>
              Your search has yielded zero results!
              <br />
              <b>Try another search term</b>
            </NoResults>
          ) : (
            <Hits hitComponent={BillHit} />
          )}
          <Pagination className="mx-auto mt-2 mb-3" />
        </Col>
      </Row>
    </SearchContainer>
  )
}
