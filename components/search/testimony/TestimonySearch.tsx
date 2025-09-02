import {
  CurrentRefinements,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox,
  useInstantSearch
} from "react-instantsearch"
import { createInstantSearchRouterNext } from "react-instantsearch-router-nextjs"
import singletonRouter from "next/router"
import {
  StyledTabContent,
  StyledTabNav
} from "components/EditProfilePage/StyledEditProfileComponents"
import { currentGeneralCourt } from "functions/src/shared"
import { SortByItem } from "instantsearch.js/es/connectors/sort-by/connectSortBy"
import { useState, useMemo } from "react"
import { TabContainer, TabPane } from "react-bootstrap"
import styled from "styled-components"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"
import { Col, Nav, Row } from "../../bootstrap"
import { NoResults } from "../NoResults"
import { ResultCount } from "../ResultCount"
import { SearchContainer } from "../SearchContainer"
import { SearchErrorBoundary } from "../SearchErrorBoundary"
import { SortBy } from "../SortBy"
import { getServerConfig, VirtualFilters } from "../common"
import { TestimonyHit } from "./TestimonyHit"
import { useTestimonyRefinements } from "./useTestimonyRefinements"
import { FollowContext, OrgFollowStatus } from "components/shared/FollowContext"
import { pathToSearchState, searchStateToUrl } from "../routingHelpers"
import { useTranslation } from "next-i18next"

const searchClient = new TypesenseInstantSearchAdapter({
  server: getServerConfig(),
  additionalSearchParameters: {
    query_by: "billId,content,authorDisplayName,authorRole",
    exclude_fields: ""
  }
}).searchClient

export const useTestimonySort = () => {
  const { t } = useTranslation("search")
  const items: SortByItem[] = useMemo(
    () => [
      {
        label: t("sort_by.newest"),
        value: "publishedTestimony/sort/publishedAt:desc"
      },
      {
        label: t("sort_by.oldest"),
        value: "publishedTestimony/sort/publishedAt:asc"
      },
      {
        label: t("sort_by.relevance"),
        value: "publishedTestimony/sort/_text_match:desc,publishedAt:desc"
      }
    ],
    [t]
  )
  return items
}

export const TestimonySearch = () => {
  const initialSortByValue = useTestimonySort()[0].value
  return (
    <SearchErrorBoundary>
      <InstantSearch
        indexName={initialSortByValue}
        initialUiState={{
          [initialSortByValue]: {
            refinementList: { court: [String(currentGeneralCourt)] }
          }
        }}
        searchClient={searchClient}
        routing={{
          router: createInstantSearchRouterNext({
            singletonRouter,
            routerOptions: {
              cleanUrlOnDispose: false,
              createURL: args => searchStateToUrl(args),
              parseURL: args => pathToSearchState(args)
            }
          })
        }}
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <VirtualFilters type="testimony" />
        <Layout />
      </InstantSearch>
    </SearchErrorBoundary>
  )
}

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
  const { t } = useTranslation("search")

  const onTabClick = (t: Tab) => {
    setKey(t)
    setIndexUiState(prevState => {
      const validRoles = ["user", "organization", "admin"]
      const role =
        t === "Individuals"
          ? ["user"]
          : t === "Organizations"
          ? ["organization"]
          : validRoles
      return {
        ...prevState,
        refinementList: {
          ...prevState.refinementList,
          authorRole: role
        }
      }
    })
  }

  const [followStatus, setFollowStatus] = useState<OrgFollowStatus>({})

  return (
    <>
      <FollowContext.Provider value={{ followStatus, setFollowStatus }}>
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
            <SearchBox
              placeholder="Search For Testimony"
              className="mt-2 mb-3"
            />
          </Row>
          <Row>
            <Col xs={0} lg={3}>
              {refinements.options}
            </Col>
            <Col className="d-flex flex-column">
              <RefinementRow>
                <ResultCount className="flex-grow-1 m-1" />
                <SortBy items={useTestimonySort()} />
                {refinements.show}
              </RefinementRow>
              <CurrentRefinements
                className="mt-2 mb-2"
                excludedAttributes={["authorRole"]}
              />
              {status === "empty" ? (
                <NoResults>
                  {t("zero_results")}
                  <br />
                  <b>{t("another_term")}</b>
                </NoResults>
              ) : (
                <Hits hitComponent={TestimonyHit} />
              )}
              <Pagination className="mx-auto mt-2 mb-3" />
            </Col>
          </Row>
        </SearchContainer>
      </FollowContext.Provider>
    </>
  )
}
