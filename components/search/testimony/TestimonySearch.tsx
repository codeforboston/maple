import {
  CurrentRefinements,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox,
  useInstantSearch
} from "@alexjball/react-instantsearch-hooks-web"
import {
  StyledTabContent,
  StyledTabNav
} from "components/EditProfilePage/StyledEditProfileComponents"
import { currentGeneralCourt } from "functions/src/shared"
import { SortByItem } from "instantsearch.js/es/connectors/sort-by/connectSortBy"
import { useState } from "react"
import { TabContainer, TabPane } from "react-bootstrap"
import styled from "styled-components"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"
import { Col, Nav, Row } from "../../bootstrap"
import { NoResults } from "../NoResults"
import { ResultCount } from "../ResultCount"
import { SearchContainer } from "../SearchContainer"
import { SearchErrorBoundary } from "../SearchErrorBoundary"
import { SortBy } from "../SortBy"
import { getServerConfig } from "../common"
import { useRouting } from "../useRouting"
import { TestimonyHit } from "./TestimonyHit"
import { useTestimonyRefinements } from "./useTestimonyRefinements"

const searchClient = new TypesenseInstantSearchAdapter({
  server: getServerConfig(),
  additionalSearchParameters: {
    query_by: "billId,content,authorDisplayName,authorRole",
    exclude_fields: ""
  }
}).searchClient

const items: SortByItem[] = [
  {
    label: "Sort by New -> Old",
    value: "publishedTestimony/sort/publishedAt:desc"
  },
  {
    label: "Sort by Old -> New",
    value: "publishedTestimony/sort/publishedAt:asc"
  },
  {
    label: "Sort by Relevance",
    value: "publishedTestimony/sort/_text_match:desc,publishedAt:desc"
  }
]

export const initialSortByValue = items[0].value

export const TestimonySearch = () => (
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

const tabs = ["All", "Individuals", "Organizations"]
type Tab = (typeof tabs)[number]

const Layout = () => {
  const [key, setKey] = useState<string>("All")
  const refinements = useTestimonyRefinements()
  const status = useSearchStatus()
  const { indexUiState, setIndexUiState } = useInstantSearch()

  const onTabClick = (t: Tab) => {
    setKey(t)
    setIndexUiState(prevState => {
      const prevRefinements = prevState.refinementList
      const role =
        t === "Individuals"
          ? ["user"]
          : t === "Organizations"
          ? ["organization"]
          : ["user", "organization"]
      return {
        ...prevState,
        refinementList: { ...prevState.refinementList, authorRole: role }
      }
    })
  }

  return (
    <>
      <TabContainer activeKey={key} onSelect={(k: any) => setKey(k)}>
        <StyledTabNav>
          {tabs.map((t, i) => (
            <Nav.Item key={t}>
              <Nav.Link
                eventKey={t}
                className={`rounded-top m-0 p-0`}
                onClick={e => onTabClick(t)}
              >
                <p className={`my-0 ${i == 0 ? "" : "mx-4"}`}>{t}</p>
                <hr className={`my-0`} />
              </Nav.Link>
            </Nav.Item>
          ))}
        </StyledTabNav>
        <StyledTabContent></StyledTabContent>
      </TabContainer>
      <SearchContainer>
        <Row>
          <SearchBox placeholder="Search For Testimony" className="mt-2 mb-3" />
        </Row>
        <Row>
          {refinements.options}
          <Col className="d-flex flex-column">
            <RefinementRow>
              <ResultCount className="flex-grow-1 m-1" />
              <SortBy items={items} />
              {refinements.show}
            </RefinementRow>
            <CurrentRefinements
              className="mt-2 mb-2"
              excludedAttributes={["authorRole"]}
            />
            {status === "empty" ? (
              <NoResults>
                Your search has yielded zero results!
                <br />
                <b>Try another search term</b>
              </NoResults>
            ) : (
              <Hits hitComponent={TestimonyHit} />
            )}
            <Pagination className="mx-auto mt-2 mb-3" />
          </Col>
        </Row>
      </SearchContainer>
    </>
  )
}
