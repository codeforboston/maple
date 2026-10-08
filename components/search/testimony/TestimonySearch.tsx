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
import { TabContainer } from "react-bootstrap"
import styled from "styled-components"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"
import { Col, Form, Nav, Row } from "../../bootstrap"
import { NoResults } from "../NoResults"
import { ResultCount } from "../ResultCount"
import { SearchContainer } from "../SearchContainer"
import { SearchErrorBoundary } from "../SearchErrorBoundary"
import { SortBy } from "../SortBy"
import { getServerConfig, VirtualFilters } from "../common"
import { TestimonyHit } from "./TestimonyHit"
import { useTestimonyRefinements } from "./useTestimonyRefinements"
import { FilterLabel, FilterSection } from "../useRefinements"
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

const ControlsBar = styled.div`
  background: white;
  border: 1px solid var(--maple-surface-border);
  border-radius: var(--bs-border-radius-xl);
  box-shadow: var(--maple-shadow-sm);
  padding: var(--maple-space-lg);
  margin-bottom: var(--maple-space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--maple-space-sm);
`

const RefinementRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--maple-space-sm);
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

/* Only one of the two author-type controls shows, by skin; display: none keeps
   the other out of the accessibility tree. */
const AuthorTypeTabs = styled.div`
  [data-maple-theme="dd"] & {
    display: none;
  }
`

const AuthorTypeFilterSection = styled(FilterSection)`
  display: none;

  [data-maple-theme="dd"] & {
    display: block;
  }

  /* Bootstrap's primary here is red (styles/bootstrap.scss), which checked
     radios take; these use the site's navy instead. */
  .form-check-input:checked {
    background-color: var(--maple-brand-primary);
    border-color: var(--maple-brand-primary);
  }

  /* The same for the focus ring, which Bootstrap also draws in its red. */
  .form-check-input:focus {
    border-color: var(--maple-brand-primary);
    box-shadow: 0 0 0 0.25rem
      color-mix(in srgb, var(--maple-brand-primary) 25%, transparent);
  }
`

const tabs = ["All", "Individuals", "Organizations"]
type Tab = (typeof tabs)[number]

const Layout = () => {
  const [key, setKey] = useState<string>("All")
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

  /* The All / Individuals / Organizations choice comes two ways, one per skin,
     both setting the same authorRole filter. Maple: tabs above the search.
     Digital Democracy and Mixed: the first group in the filter panel. */
  const authorTypeFilter = (
    <AuthorTypeFilterSection>
      <FilterLabel>{t("author_type")}</FilterLabel>
      {tabs.map(tab => (
        <Form.Check
          key={tab}
          type="radio"
          id={`author-type-${tab}`}
          name="author-type"
          label={tab}
          checked={key === tab}
          onChange={() => onTabClick(tab)}
        />
      ))}
    </AuthorTypeFilterSection>
  )
  const refinements = useTestimonyRefinements(authorTypeFilter)

  const [followStatus, setFollowStatus] = useState<OrgFollowStatus>({})

  return (
    <>
      <FollowContext.Provider value={{ followStatus, setFollowStatus }}>
        <AuthorTypeTabs>
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
        </AuthorTypeTabs>
        <SearchContainer>
          <ControlsBar>
            <SearchBox placeholder="Search For Testimony" />
            <RefinementRow>
              <ResultCount className="flex-grow-1" />
              <SortBy items={useTestimonySort()} />
              {refinements.show}
            </RefinementRow>
            <CurrentRefinements excludedAttributes={["authorRole"]} />
          </ControlsBar>
          <Row>
            <Col xs={0} lg={3} className="search-filter-column">
              {refinements.options}
            </Col>
            <Col className="d-flex flex-column">
              {status === "empty" ? (
                <NoResults>
                  {t("zero_results")}
                  <br />
                  <b>{t("another_term")}</b>
                </NoResults>
              ) : (
                <Hits hitComponent={TestimonyHit} />
              )}
              <Pagination className="mx-auto mt-4 mb-3" />
            </Col>
          </Row>
        </SearchContainer>
      </FollowContext.Provider>
    </>
  )
}
