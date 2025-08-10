import { TFunction, useTranslation } from "next-i18next"
import {
  CurrentRefinements,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox,
  useInstantSearch
} from "react-instantsearch"
import { currentGeneralCourt } from "functions/src/shared"
import styled from "styled-components"
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter"
import { Col, Container, Row, Spinner } from "../../bootstrap"
import { NoResults } from "../NoResults"
import { ResultCount } from "../ResultCount"
import { SearchContainer } from "../SearchContainer"
import { SearchErrorBoundary } from "../SearchErrorBoundary"
import { useRouting } from "../useRouting"
import { BillHit } from "./BillHit"
import { useBillRefinements } from "./useBillRefinements"
import { SortBy, SortByWithConfigurationItem } from "../SortBy"
import { getServerConfig, VirtualFilters } from "../common"
import { useBillSort } from "./useBillSort"
import { FC, useState } from "react"

const searchClient = new TypesenseInstantSearchAdapter({
  server: getServerConfig(),
  additionalSearchParameters: {
    query_by: "number,title,body",
    exclude_fields: "body"
  }
}).searchClient

const extractLastSegmentOfRefinements = (items: any[]) => {
  return items.map(item => {
    if (item.label != "topics.lvl1") return item
    const newRefinements = item.refinements.map(
      (refinement: { label: string }) => {
        // Split the label to extract the last part of the hierarchy
        const lastPartOfLabel = refinement.label.includes(">")
          ? refinement.label.split(" > ").pop()
          : refinement.label

        return {
          ...refinement,
          // Update label to only show the last part
          label: lastPartOfLabel
        }
      }
    )

    return {
      ...item,
      label: "Tags",
      refinements: newRefinements
    }
  })
}

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
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <VirtualFilters type="bill" />
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

const StyledLoadingContainer = styled(Container)`
  background-color: white;
  display: flex;
  height: 300px;
  justify-content: center;
  align-items: center;
`

const Results = ({
  status,
  t
}: {
  status: ReturnType<typeof useSearchStatus>
  t: TFunction
}) => {
  const [isLoadingBillDetails, setIsLoadingBillDetails] = useState(false)

  if (isLoadingBillDetails) {
    return (
      <StyledLoadingContainer>
        <Spinner animation="border" className="mx-auto" />
      </StyledLoadingContainer>
    )
  } else if (status === "empty") {
    return (
      <NoResults>
        {t("zero_results")}
        <br />
        <b>{t("another_term")}</b>
      </NoResults>
    )
  } else {
    return (
      <Hits
        hitComponent={BillHit}
        onClick={() => setIsLoadingBillDetails(true)}
      />
    )
  }
}

const Layout: FC<
  React.PropsWithChildren<{ items: SortByWithConfigurationItem[] }>
> = ({ items }) => {
  const refinements = useBillRefinements()
  const status = useSearchStatus()

  const { t } = useTranslation("billSearch")

  return (
    <SearchContainer>
      <Row>
        <SearchBox placeholder="Search For Bills" className="mt-2 mb-3" />
      </Row>
      <Row>
        <Col xs={0} lg={3}>
          {refinements.options}
        </Col>
        <Col className="d-flex flex-column">
          <RefinementRow>
            <ResultCount className="flex-grow-1 m-1" />
            <SortBy items={items} />
            {refinements.show}
          </RefinementRow>
          <CurrentRefinements
            className="mt-2 mb-2"
            excludedAttributes={["nextHearingAt"]}
            transformItems={extractLastSegmentOfRefinements}
          />
          <Results status={status} t={t} />
          <Pagination className="mx-auto mt-2 mb-3" />
        </Col>
      </Row>
    </SearchContainer>
  )
}
