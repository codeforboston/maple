import {
  CurrentRefinements,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox,
  useInstantSearch
} from "@alexjball/react-instantsearch-hooks-web"
import { getServerConfig } from "components/search/common"
import { SearchContainer } from "components/search/SearchContainer"
import { SearchErrorBoundary } from "components/search/SearchErrorBoundary"
import { initialSortByValue, SortBy } from "components/search/SortBy"
import { useRouting } from "components/search/useRouting"
import { currentGeneralCourt } from "functions/src/shared"
import ErrorPage from "next/error"
import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { TabPane } from "react-bootstrap"
import TabContainer from "react-bootstrap/TabContainer"
import styled from "styled-components"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"
import { useMediaQuery } from "usehooks-ts"
import { AllTestimoniesTab } from "./AllTestimoniesTab"
import { IndividualsTab } from "./IndividualsTab"
import { OrganizationsTab } from "./OrganizationsTab"
import {
  Header,
  StyledTabContent,
  StyledTabNav
} from "components/shared/StyledSharedComponents"
import { useAuth } from "../auth"
import { Button, Col, Container, Nav, Row, Spinner } from "../bootstrap"
import { usePublicProfile } from "../db"

const searchClient = new TypesenseInstantSearchAdapter({
  server: getServerConfig(),
  additionalSearchParameters: {
    query_by: "number,title,body",
    exclude_fields: "body"
  }
}).searchClient

export default function BrowseTestimony() {
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
        routing={useRouting()}
      >
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

const Layout = () => {
  const [key, setKey] = useState("AllTestimonies")

  const { t } = useTranslation("browseTestimony")

  const tabs = [
    {
      title: t("tabs.allTestimonies"),
      eventKey: "AllTestimonies",
      content: <AllTestimoniesTab className="mt-3 mb-4" />
    },
    {
      title: t("tabs.individuals"),
      eventKey: "Individuals",
      content: <IndividualsTab className="mt-3 mb-4" />
    },
    {
      title: t("tabs.organizations"),
      eventKey: "Organizations",
      content: <OrganizationsTab className="mt-3 mb-4" />
    }
  ]

  return (
    <>
      <TabContainer activeKey={key} onSelect={(k: any) => setKey(k)}>
        <StyledTabNav>
          {tabs.map((t, i) => (
            <Nav.Item key={t.eventKey}>
              <Nav.Link eventKey={t.eventKey} className={`rounded-top m-0 p-0`}>
                <p className={`my-0 ${i == 0 ? "" : "mx-4"}`}>{t.title}</p>
                <hr className={`my-0`} />
              </Nav.Link>
            </Nav.Item>
          ))}
        </StyledTabNav>
        {/* <StyledTabContent>
          {tabs.map(t => (
            <TabPane key={t.eventKey} title={t.title} eventKey={t.eventKey}>
              {t.content}
            </TabPane>
          ))}
        </StyledTabContent> */}
      </TabContainer>
      <SearchContainer>
        <Row>
          <SearchBox placeholder="Search Testimonies" className="mt-2 mb-3" />
        </Row>
        <Row>
          {/* {refinements.options} */}
          <Col xs={3} lg={3}>
            Refinements
          </Col>
          <Col className="d-flex flex-column">
            <RefinementRow>
              {/* <ResultCount className="flex-grow-1 m-1" /> */}
              <SortBy />
              {/* {refinements.show} */}
            </RefinementRow>
            <CurrentRefinements className="mt-2 mb-2" />
            {status === "empty" ? (
              // <NoResults>
              //   Your search has yielded zero results!
              //   <br />
              //   <b>Try another search term</b>
              // </NoResults>
              <b>Try another search term</b>
            ) : (
              // <Hits hitComponent={BillHit} />
              <b>Hits!</b>
            )}
            <Pagination className="mx-auto mt-2 mb-3" />
          </Col>
        </Row>
      </SearchContainer>
    </>
  )
}
