import {
  CurrentRefinements,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox,
  useConfigure,
  useInstantSearch
} from "@alexjball/react-instantsearch-hooks-web"
import { currentGeneralCourt } from "functions/src/shared"
import { SortByItem } from "instantsearch.js/es/connectors/sort-by/connectSortBy"
import styled from "styled-components"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"
import { Col, Row } from "../../bootstrap"
import { NoResults } from "../NoResults"
import { ResultCount } from "../ResultCount"
import { SearchContainer } from "../SearchContainer"
import { SearchErrorBoundary } from "../SearchErrorBoundary"
import { useRouting } from "../useRouting"
import { BillHit } from "./BillHit"
import { useBillRefinements } from "./useBillRefinements"
import { SortBy, SortByWithConfigurationItem } from "../SortBy"
import { getServerConfig } from "../common"
import { useBillSort } from "./useBillSort"
import { FC, RefObject, useEffect, useRef } from "react"
import { QuestionTooltip } from "components/tooltip"

const searchClient = new TypesenseInstantSearchAdapter({
  server: getServerConfig(),
  additionalSearchParameters: {
    query_by: "number,title,body",
    exclude_fields: "body"
  }
}).searchClient

export const BillSearch = () => {
  const items = useBillSort()
  const initialSortByValue = items[0].value
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
        <Layout items={items} />
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

const addToolTipForCity = (nodeRef: RefObject<HTMLDivElement>) => {
  // fetch the city search refinement form
  const citySearch = document.querySelector<HTMLFormElement>(".city-search form")!;
  citySearch?.setAttribute("style", "gap: 5px;");
  // fetch the city search refinement form input
  const input = document.querySelector<HTMLFormElement>(".city-search form .ais-SearchBox-input")!;
  input?.setAttribute("style", "padding-right: 0");
  // create the tool tip div to be added beside the input
  const toolTip = document.createElement("div")!;
  toolTip.classList.add(".city-tooltip");
  toolTip.style.margin = "auto 0";
  // add the tooltip div at the beginning of the form
  citySearch?.prepend(toolTip);
  // add the component to the div using the ref
  toolTip.append(nodeRef?.current!);
}

const Layout: FC<
  React.PropsWithChildren<{ items: SortByWithConfigurationItem[] }>
> = ({ items }) => {
  const refinements = useBillRefinements()
  const status = useSearchStatus()
  const nodeRef = useRef<HTMLDivElement>(null);

  // add the tooltip beside city refinement box on page load
  useEffect(() => {
    addToolTipForCity(nodeRef); 
  }, []);

  return (
    <SearchContainer>
      <QuestionTooltip placement={"top"} nodeRef={nodeRef}>
        <p className="mb-0">
          This filter only captures bills submitted via the
          {" "}
          <a
            className="text-light"
            href="https://www.somervillecdc.org/news/what-is-a-home-rule-petition/#:~:text=A%20Home%20Rule%20Petition%20is,an%20aspect%20of%20state%20law"
            target="_blank"
          >
            home rule
          </a>
          {" "}
          petition; not every bill that concerns a city
        </p>
      </QuestionTooltip>
      <Row>
        <SearchBox placeholder="Search For Bills" className="mt-2 mb-3" />
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
            excludedAttributes={["nextHearingAt"]}
          />
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
